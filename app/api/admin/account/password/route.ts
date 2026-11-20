import { createSession, hashPassword, requireAdmin, validatePassword, verifyPassword } from "@/lib/auth";
import { findUserById, updateUser } from "@/lib/users";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  if (typeof body.currentPassword !== "string" || !(await verifyPassword(body.currentPassword, auth.user.passwordHash))) {
    return Response.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  const pwError = validatePassword(body.newPassword);
  if (pwError) return Response.json({ error: pwError }, { status: 400 });

  const result = await updateUser(auth.user.id, { passwordHash: await hashPassword(body.newPassword) });
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  // Password change invalidates all sessions (pwv bump); keep this browser signed in.
  const fresh = await findUserById(auth.user.id);
  if (fresh) await createSession(fresh);
  return Response.json({ success: true });
}
