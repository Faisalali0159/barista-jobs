import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAG, getSiteContentFresh, saveSiteContent } from "@/lib/content";

export async function GET(request: Request) {
  const auth = await requireAdmin(request, "content");
  if ("error" in auth) return auth.error;
  return Response.json(await getSiteContentFresh());
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request, "content");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid content" }, { status: 400 });
  }
  const saved = await saveSiteContent(body);
  // Expire immediately so the public site shows the change on the next visit.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/");
  return Response.json(saved);
}
