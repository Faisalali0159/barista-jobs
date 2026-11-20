import { requireAdmin } from "@/lib/auth";
import { allowedStatuses, deleteRecord, isRecordKind, patchRecord } from "@/lib/db";
import { deleteUpload, uploadNameFromPath } from "@/lib/uploads";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/records/[kind]/[id]">) {
  const auth = await requireAdmin(request, "records:write");
  if ("error" in auth) return auth.error;

  const { kind, id } = await ctx.params;
  if (!isRecordKind(kind)) return Response.json({ error: "Unknown record type" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const patch: { status?: string; notes?: string } = {};
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !allowedStatuses(kind).includes(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") {
      return Response.json({ error: "Invalid notes" }, { status: 400 });
    }
    patch.notes = body.notes.slice(0, 5000);
  }

  const updated = await patchRecord(kind, id, patch);
  if (!updated) return Response.json({ error: "Record not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/records/[kind]/[id]">) {
  const auth = await requireAdmin(request, "records:delete");
  if ("error" in auth) return auth.error;

  const { kind, id } = await ctx.params;
  if (!isRecordKind(kind)) return Response.json({ error: "Unknown record type" }, { status: 404 });

  const removed = await deleteRecord(kind, id);
  if (!removed) return Response.json({ error: "Record not found" }, { status: 404 });

  // Clean up attached uploads.
  if (kind === "job-seekers") {
    const r = removed as { cvPath?: string; photoPath?: string };
    for (const p of [r.cvPath, r.photoPath]) {
      const name = p ? uploadNameFromPath(p) : null;
      if (name) await deleteUpload(name).catch(() => undefined);
    }
  }
  return Response.json({ success: true });
}
