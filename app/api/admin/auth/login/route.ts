import {
  clearFailures,
  clientKey,
  createSession,
  isThrottled,
  recordFailure,
  verifyPassword,
} from "@/lib/auth";
import { findUserByUsername, normalizeUsername, updateUser } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = normalizeUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return Response.json({ error: "Username and password are required" }, { status: 400 });
  }

  const key = clientKey(request, username);
  if (isThrottled(key)) {
    return Response.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const user = await findUserByUsername(username);
  // Always run a hash comparison so response time doesn't reveal whether the username exists.
  const ok = await verifyPassword(
    password,
    user?.passwordHash ?? "scrypt$00000000000000000000000000000000$" + "00".repeat(64)
  );
  if (!user || !user.active || !ok) {
    recordFailure(key);
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  clearFailures(key);
  await updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  await createSession(user);
  return Response.json({ success: true });
}
