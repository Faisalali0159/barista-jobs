import { readJsonFile, updateJsonFile } from "./store";

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

const FILE = "admin-users.json";

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
  return readJsonFile<AdminUser[]>(FILE, []);
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  return (await listUsers()).find((u) => u.id === id) ?? null;
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const e = email.trim().toLowerCase();
  return (await listUsers()).find((u) => u.email === e) ?? null;
}

export async function hasAnyUser(): Promise<boolean> {
  return (await listUsers()).length > 0;
}

export type MutationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Creates a user. If `onlyIfEmpty`, fails when any user already exists (first-run setup). */
export async function createUser(
  input: { name: string; email: string; role: Role; passwordHash: string },
  opts: { onlyIfEmpty?: boolean } = {}
): Promise<MutationResult<AdminUser>> {
  return updateJsonFile<AdminUser[], MutationResult<AdminUser>>(FILE, [], (users) => {
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
  return updateJsonFile<AdminUser[], MutationResult<AdminUser>>(FILE, [], (users) => {
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
  return updateJsonFile<AdminUser[], MutationResult<null>>(FILE, [], (users) => {
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
