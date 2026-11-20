import { requireAdmin } from "@/lib/auth";
import { getEmployers, getJobSeekers, isRecordKind } from "@/lib/db";

function csvCell(v: unknown): string {
  let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection from user-submitted text.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request, ctx: RouteContext<"/api/admin/records/[kind]">) {
  const auth = await requireAdmin(request, "records:read");
  if ("error" in auth) return auth.error;

  const { kind } = await ctx.params;
  if (!isRecordKind(kind)) return Response.json({ error: "Unknown record type" }, { status: 404 });

  const rows = kind === "job-seekers" ? await getJobSeekers() : await getEmployers();

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const all = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const csv = [
      all.map(csvCell).join(","),
      ...rows.map((r) => all.map((k) => csvCell((r as unknown as Record<string, unknown>)[k])).join(",")),
    ].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return Response.json(rows);
}
