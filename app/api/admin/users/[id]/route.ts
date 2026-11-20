import { hashPassword, requireAdmin, validatePassword } from "@/lib/auth";
import { deleteUser, toPublic, updateUser, type Role } from "@/lib/users";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const auth = await requireAdmin(request, "users");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const body = await request.json().catch(() => ({}));
  const patch: Parameters<typeof updateUser>[1] = {};

  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (body.role === "admin" || body.role === "staff") patch.role = body.role as Role;
  if (typeof body.active === "boolean") patch.active = body.active;
  if (body.password !== undefined) {
    const pwError = validatePassword(body.password);
    if (pwError) return Response.json({ error: pwError }, { status: 400 });
    patch.passwordHash = await hashPassword(body.password);
  }

  const result = await updateUser(id, patch);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.error === "User not found" ? 404 : 400 });
  }
  return Response.json(toPublic(result.value));
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const auth = await requireAdmin(request, "users");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  if (id === auth.user.id) {
    return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
  }
  const result = await deleteUser(id);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.error === "User not found" ? 404 : 400 });
  }
  return Response.json({ success: true });
}
