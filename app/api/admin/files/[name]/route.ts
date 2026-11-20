import { requireAdmin } from "@/lib/auth";
import { getUpload, isSafeUploadName } from "@/lib/uploads";

export async function GET(request: Request, ctx: RouteContext<"/api/admin/files/[name]">) {
  const auth = await requireAdmin(request, "records:read");
  if ("error" in auth) return auth.error;

  const { name } = await ctx.params;
  if (!isSafeUploadName(name)) return Response.json({ error: "Not found" }, { status: 404 });

  const file = await getUpload(name);
  if (!file) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
