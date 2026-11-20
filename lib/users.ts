import { connection } from "next/server";
import { db, withTx } from "./pg";

export type Role = "admin" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  /** Bumped on password change; invalidates all existing sessions. */
  pwv: number;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type PublicUser = Omit<AdminUser, "passwordHash" | "pwv">;


export function toPublic(u: AdminUser): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export async function listUsers(): Promise<AdminUser[]> {
  const { rows } = await (await db()).query("SELECT data FROM admin_users ORDER BY created_at");
  return rows.map((r) => r.data as AdminUser);
}

/**
 * Read-modify-write of the whole (tiny) user list under a lock, so invariants such as
 * "at least one active admin" hold even with concurrent requests.
 */
function updateUsers<R>(
  mutate: (current: AdminUser[]) => { next: AdminUser[]; result: R }
): Promise<R> {
  return withTx("admin-users", async (c) => {
    const { rows } = await c.query("SELECT data FROM admin_users ORDER BY created_at");
    const current = rows.map((r) => r.data as AdminUser);
    const { next, result } = mutate(current);
    if (next !== current) {
      const nextIds = new Set(next.map((u) => u.id));
      for (const u of current) {
        if (!nextIds.has(u.id)) await c.query("DELETE FROM admin_users WHERE id = $1", [u.id]);
      }
      const before = new Map(current.map((u) => [u.id, u]));
      for (const u of next) {
        if (before.get(u.id) === u) continue;
        await c.query(
          `INSERT INTO admin_users (id, email, data, created_at) VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, data = EXCLUDED.data`,
          [u.id, u.email, JSON.stringify(u), u.createdAt]
        );
      }
    }
    return result;
  });
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  return (await listUsers()).find((u) => u.id === id) ?? null;
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const e = email.trim().toLowerCase();
  return (await listUsers()).find((u) => u.email === e) ?? null;
}

export async function hasAnyUser(): Promise<boolean> {
  await connection(); // user state is request-time data, never prerendered
  return (await listUsers()).length > 0;
}

export type MutationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Creates a user. If `onlyIfEmpty`, fails when any user already exists (first-run setup). */
export async function createUser(
  input: { name: string; email: string; role: Role; passwordHash: string },
  opts: { onlyIfEmpty?: boolean } = {}
): Promise<MutationResult<AdminUser>> {
  return updateUsers<MutationResult<AdminUser>>((users) => {
    if (opts.onlyIfEmpty && users.length > 0) {
      return { next: users, result: { ok: false, error: "Setup already completed" } };
    }
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) {
      return { next: users, result: { ok: false, error: "A user with this email already exists" } };
    }
    const user: AdminUser = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email,
      role: input.role,
      passwordHash: input.passwordHash,
      pwv: 1,
      active: true,
      createdAt: new Date().toISOString(),
    };
    return { next: [...users, user], result: { ok: true, value: user } };
  });
}

function activeAdminCount(users: AdminUser[]) {
  return users.filter((u) => u.role === "admin" && u.active).length;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<AdminUser, "name" | "role" | "active" | "passwordHash" | "lastLoginAt">>
): Promise<MutationResult<AdminUser>> {
  return updateUsers<MutationResult<AdminUser>>((users) => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { next: users, result: { ok: false, error: "User not found" } };
    const updated: AdminUser = { ...users[idx], ...patch };
    if (patch.passwordHash) updated.pwv = users[idx].pwv + 1;
    const next = [...users];
    next[idx] = updated;
    if (activeAdminCount(next) === 0) {
      return {
        next: users,
        result: { ok: false, error: "At least one active admin is required" },
      };
    }
    return { next, result: { ok: true, value: updated } };
  });
}

export async function deleteUser(id: string): Promise<MutationResult<null>> {
  return updateUsers<MutationResult<null>>((users) => {
    if (!users.some((u) => u.id === id)) {
      return { next: users, result: { ok: false, error: "User not found" } };
    }
    const next = users.filter((u) => u.id !== id);
    if (activeAdminCount(next) === 0) {
      return {
        next: users,
        result: { ok: false, error: "At least one active admin is required" },
      };
    }
    return { next, result: { ok: true, value: null } };
  });
}
