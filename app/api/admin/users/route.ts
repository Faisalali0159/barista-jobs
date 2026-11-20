import { hashPassword, requireAdmin, validatePassword } from "@/lib/auth";
import { USERNAME_RE, createUser, listUsers, normalizeUsername, toPublic, type Role } from "@/lib/users";

export async function GET(request: Request) {
  const auth = await requireAdmin(request, "users");
  if ("error" in auth) return auth.error;
  return Response.json((await listUsers()).map(toPublic));
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request, "users");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = normalizeUsername(body.username);
  const role: Role = body.role === "admin" ? "admin" : "staff";

  if (!name || !USERNAME_RE.test(username)) {
    return Response.json({ error: "A name and a username (3-32 letters, numbers, . _ -) are required" }, { status: 400 });
  }
  const pwError = validatePassword(body.password);
  if (pwError) return Response.json({ error: pwError }, { status: 400 });

  const result = await createUser({
    name,
    username,
    role,
    passwordHash: await hashPassword(body.password),
  });
  if (!result.ok) return Response.json({ error: result.error }, { status: 409 });
  return Response.json(toPublic(result.value), { status: 201 });
}
