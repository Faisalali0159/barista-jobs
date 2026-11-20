import { createSession, hashPassword, validatePassword } from "@/lib/auth";
import { USERNAME_RE, createUser, hasAnyUser, normalizeUsername } from "@/lib/users";

/**
 * First-run setup: creates the first admin. Only works while no users exist.
 * If SETUP_KEY is set in the environment, it must be supplied too.
 */
export async function POST(request: Request) {
  if (await hasAnyUser()) {
    return Response.json({ error: "Setup already completed" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = normalizeUsername(body.username);
  const password = body.password;

  if (process.env.SETUP_KEY && body.setupKey !== process.env.SETUP_KEY) {
    return Response.json({ error: "Invalid setup key" }, { status: 403 });
  }
  if (!name || !USERNAME_RE.test(username)) {
    return Response.json({ error: "A name and a username (3-32 letters, numbers, . _ -) are required" }, { status: 400 });
  }
  const pwError = validatePassword(password);
  if (pwError) return Response.json({ error: pwError }, { status: 400 });

  const result = await createUser(
    { name, username, role: "admin", passwordHash: await hashPassword(password) },
    { onlyIfEmpty: true }
  );
  if (!result.ok) return Response.json({ error: result.error }, { status: 403 });

  await createSession(result.value);
  return Response.json({ success: true });
}
