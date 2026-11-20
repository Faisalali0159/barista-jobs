import { connection } from "next/server";
import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import { db, kvGet } from "./pg";
import { findUserById, type AdminUser, type Role } from "./users";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

export const SESSION_COOKIE = "bj_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/* ---------------------------- password hashing ---------------------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (password.length > 200) return "Password is too long";
  return null;
}

/* ------------------------------ session secret ---------------------------- */

let cachedSecret: Buffer | null = null;

async function getSecret(): Promise<Buffer> {
  if (cachedSecret) return cachedSecret;
  if (process.env.SESSION_SECRET) {
    cachedSecret = Buffer.from(process.env.SESSION_SECRET);
    return cachedSecret;
  }
  // Persisted in Postgres so every server instance shares the same secret.
  const existing = await kvGet<string | null>("session-secret", null);
  if (!existing) {
    await (await db()).query(
      "INSERT INTO kv (key, value) VALUES ('session-secret', $1) ON CONFLICT (key) DO NOTHING",
      [JSON.stringify(randomBytes(48).toString("hex"))]
    );
  }
  const stored = (await kvGet<string | null>("session-secret", null)) as string;
  cachedSecret = Buffer.from(stored, "hex");
  return cachedSecret;
}

async function sign(payload: string): Promise<string> {
  return createHmac("sha256", await getSecret()).update(payload).digest("base64url");
}

/* --------------------------------- sessions ------------------------------- */

interface SessionPayload {
  uid: string;
  pwv: number;
  exp: number; // unix seconds
}

export async function createSession(user: AdminUser): Promise<void> {
  const payload: SessionPayload = {
    uid: user.id,
    pwv: user.pwv,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${body}.${await sign(body)}`;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Returns the signed-in, active user, or null. Always re-checks the user store. */
export async function getSessionUser(): Promise<AdminUser | null> {
  await connection(); // session state is per-request: never evaluate during prerender
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = Buffer.from(await sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
  if (!payload.uid || payload.exp < Math.floor(Date.now() / 1000)) return null;

  const user = await findUserById(payload.uid);
  if (!user || !user.active || user.pwv !== payload.pwv) return null;
  return user;
}

/* ------------------------------- authorization ---------------------------- */

export type Permission = "records:read" | "records:write" | "records:delete" | "content" | "users";

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: ["records:read", "records:write", "records:delete", "content", "users"],
  staff: ["records:read", "records:write"],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

/**
 * Guard for admin route handlers. Returns the user, or a ready-made error Response.
 * Mutating requests must come from the same origin (CSRF defence on top of SameSite).
 */
export async function requireAdmin(
  request: Request,
  permission?: Permission
): Promise<{ user: AdminUser } | { error: Response }> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        // invalid origin header
      }
      if (originHost !== host) {
        return { error: Response.json({ error: "Cross-origin request blocked" }, { status: 403 }) };
      }
    }
  }
  const user = await getSessionUser();
  if (!user) {
    return { error: Response.json({ error: "Not signed in" }, { status: 401 }) };
  }
  if (permission && !can(user.role, permission)) {
    return { error: Response.json({ error: "You do not have permission to do this" }, { status: 403 }) };
  }
  return { user };
}

/* ------------------------------ login throttling -------------------------- */

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function isThrottled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}

export function clientKey(request: Request, username: string): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${ip}|${username.toLowerCase()}`;
}
