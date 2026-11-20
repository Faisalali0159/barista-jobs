import {
  clearFailures,
  clientKey,
  createSession,
  isThrottled,
  recordFailure,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail, updateUser } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const key = clientKey(request, email);
  if (isThrottled(key)) {
    return Response.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const user = await findUserByEmail(email);
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const ok = await verifyPassword(
    password,
    user?.passwordHash ?? "scrypt$00000000000000000000000000000000$" + "00".repeat(64)
  );
  if (!user || !user.active || !ok) {
    recordFailure(key);
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  clearFailures(key);
  await updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  await createSession(user);
  return Response.json({ success: true });
}
