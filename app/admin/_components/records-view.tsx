"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  PageHeader,
  StatusBadge,
  api,
  btnDanger,
  btnGhost,
  btnPrimary,
  formatDate,
  inputCls,
  useAdminUser,
  useFlash,
} from "./ui";

type Kind = "job-seekers" | "employers";

interface BaseRecord {
  id: string;
  phone: string;
  city: string;
  status: string;
  notes?: string;
  message?: string;
  details?: string;
  createdAt: string;
  [key: string]: unknown;
}

const STATUSES: Record<Kind, string[]> = {
  "job-seekers": ["new", "contacted", "shortlisted", "placed", "rejected"],
  employers: ["new", "contacted", "in-progress", "completed", "rejected"],
};

export default function RecordsView({ kind }: { kind: Kind }) {
  const user = useAdminUser();
  const isSeekers = kind === "job-seekers";
  const [rows, setRows] = useState<BaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const { flash, ok, fail } = useFlash();

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<BaseRecord[]>(`/api/admin/records/${kind}`)
      .then((data) => !cancelled && setRows(data))
      .catch((e) => !cancelled && fail(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, reloadKey]);

  const load = () => setReloadKey((k) => k + 1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return JSON.stringify(Object.values(r)).toLowerCase().includes(q);
    });
  }, [rows, query, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [rows]);

  async function patch(id: string, body: { status?: string; notes?: string }) {
    try {
      const updated = await api<BaseRecord>(`/api/admin/records/${kind}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      ok("Saved");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(r: BaseRecord) {
    const label = String(r.fullName ?? r.businessName ?? "this record");
    if (!confirm(`Permanently delete ${label}? This also removes any uploaded files and cannot be undone.`)) return;
    try {
      await api(`/api/admin/records/${kind}/${r.id}`, { method: "DELETE" });
      setRows((rs) => rs.filter((x) => x.id !== r.id));
      ok("Deleted");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <>
      <PageHeader
        title={isSeekers ? "Job Seekers" : "Business Requests"}
        subtitle={isSeekers ? "Applications submitted from the website" : "Staffing requests from businesses"}
        actions={
          <div className="flex gap-2">
            <button onClick={load} className={btnGhost}>
              Refresh
            </button>
            <a href={`/api/admin/records/${kind}?format=csv`} className={btnGhost}>
              Export CSV
            </a>
          </div>
        }
      />

      <div className="space-y-4">
        {flash}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, city..."
              className={inputCls}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} sm:w-56`}
            >
              <option value="all">All statuses ({rows.length})</option>
              {STATUSES[kind].map((s) => (
                <option key={s} value={s}>
                  {s.replace("-", " ")} ({counts[s] ?? 0})
                </option>
              ))}
            </select>
          </div>
        </Card>

        {loading ? (
          <p className="text-center py-12 text-[var(--gray-400)]">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="text-center py-10 text-[var(--gray-400)]">
              {rows.length === 0 ? "Nothing here yet" : "No results match your filters"}
            </p>
          </Card>
        ) : (
          filtered.map((r) => {
            const open = openId === r.id;
            const title = String(isSeekers ? r.fullName : r.businessName);
            return (
              <article key={r.id} className="bg-white rounded-xl border border-[var(--gray-100)] shadow-sm">
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy truncate">{title}</div>
                    <div className="text-sm text-[var(--gray-500)] truncate">
                      {isSeekers
                        ? `${r.position} · ${r.experience} · ${r.city}`
                        : `${r.staffType} × ${r.staffCount} · ${r.city}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--gray-400)]">{formatDate(r.createdAt)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </button>

                {open && (
                  <div className="px-5 pb-5 border-t border-[var(--gray-100)] pt-4 space-y-4">
                    <div className="flex gap-4 items-start">
                      {isSeekers && typeof r.photoPath === "string" && (
                        <img src={r.photoPath} alt={title} className="w-20 h-20 rounded-xl object-cover" />
                      )}
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm flex-1">
                        <Info label="Phone">
                          <a href={`tel:${r.phone}`} className="text-orange hover:underline">
                            {r.phone}
                          </a>
                        </Info>
                        <Info label="City">{r.city}</Info>
                        {isSeekers ? (
                          <>
                            <Info label="Position">{String(r.position)}</Info>
                            <Info label="Experience">{String(r.experience)}</Info>
                          </>
                        ) : (
                          <>
                            <Info label="Contact person">{String(r.contactPerson)}</Info>
                            <Info label="Staff type">{String(r.staffType)}</Info>
                            <Info label="Staff needed">{String(r.staffCount)}</Info>
                            {typeof r.experienceRequired === "string" && (
                              <Info label="Experience required">{r.experienceRequired}</Info>
                            )}
                          </>
                        )}
                      </dl>
                    </div>

                    {!isSeekers && Array.isArray(r.services) && r.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(r.services as string[]).map((s) => (
                          <span key={s} className="px-2.5 py-1 bg-orange/10 text-orange text-xs font-medium rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {(r.message || r.details) && (
                      <p className="text-sm text-[var(--gray-600)] bg-[var(--gray-50)] rounded-lg p-3 whitespace-pre-wrap">
                        {r.message || r.details}
                      </p>
                    )}

                    {isSeekers && typeof r.cvPath === "string" && (
                      <a
                        href={r.cvPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-orange hover:text-orange-dark"
                      >
                        Download CV →
                      </a>
                    )}

                    <div className="grid sm:grid-cols-[220px_1fr] gap-4 pt-2">
                      <label className="block">
                        <span className="block text-xs font-medium text-[var(--gray-500)] mb-1">Status</span>
                        <select
                          value={r.status}
                          onChange={(e) => patch(r.id, { status: e.target.value })}
                          className={inputCls}
                        >
                          {STATUSES[kind].map((s) => (
                            <option key={s} value={s}>
                              {s.replace("-", " ")}
                            </option>
                          ))}
                        </select>
                      </label>
                      <NotesEditor initial={r.notes ?? ""} onSave={(notes) => patch(r.id, { notes })} />
                    </div>

                    {user.role === "admin" && (
                      <div className="pt-1">
                        <button onClick={() => remove(r)} className={btnDanger}>
                          Delete permanently
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--gray-400)]">{label}</dt>
      <dd className="font-medium text-navy break-words">{children}</dd>
    </div>
  );
}

function NotesEditor({ initial, onSave }: { initial: string; onSave: (notes: string) => void }) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <div>
      <span className="block text-xs font-medium text-[var(--gray-500)] mb-1">Internal notes (never shown publicly)</span>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className={inputCls} />
      {dirty && (
        <button onClick={() => onSave(value)} className={`${btnPrimary} mt-2`}>
          Save notes
        </button>
      )}
    </div>
  );
}
