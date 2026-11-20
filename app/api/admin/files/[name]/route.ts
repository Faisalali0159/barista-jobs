import { readFile } from "fs/promises";
import { join } from "path";
import { requireAdmin } from "@/lib/auth";
import { UPLOADS_DIR, isSafeUploadName, mimeFor } from "@/lib/uploads";

export async function GET(request: Request, ctx: RouteContext<"/api/admin/files/[name]">) {
  const auth = await requireAdmin(request, "records:read");
  if ("error" in auth) return auth.error;

  const { name } = await ctx.params;
  if (!isSafeUploadName(name)) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    const data = await readFile(join(UPLOADS_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeFor(name),
        "Content-Disposition": `inline; filename="${name}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
