"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, PageHeader, StatusBadge, api, formatDate, useAdminUser } from "../_components/ui";

interface Row {
  id: string;
  status: string;
  city: string;
  createdAt: string;
  fullName?: string;
  position?: string;
  businessName?: string;
  staffType?: string;
  staffCount?: number;
}

export default function DashboardPage() {
  const user = useAdminUser();
  const [seekers, setSeekers] = useState<Row[]>([]);
  const [employers, setEmployers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<Row[]>("/api/admin/records/job-seekers"),
      api<Row[]>("/api/admin/records/employers"),
    ])
      .then(([s, e]) => {
        setSeekers(s);
        setEmployers(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const newSeekers = seekers.filter((s) => s.status === "new").length;
  const newEmployers = employers.filter((s) => s.status === "new").length;
  const staffNeeded = employers
    .filter((e) => e.status !== "completed" && e.status !== "rejected")
    .reduce((sum, e) => sum + (e.staffCount ?? 0), 0);
  const cities = new Set([...seekers, ...employers].map((r) => r.city)).size;

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} subtitle="Here's what's happening on the site." />

      {loading ? (
        <p className="text-[var(--gray-400)]">Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="New applications" value={newSeekers} sub={`${seekers.length} total`} href="/admin/job-seekers" />
            <Stat label="New business requests" value={newEmployers} sub={`${employers.length} total`} href="/admin/employers" />
            <Stat label="Open staff needed" value={staffNeeded} sub="from active requests" />
            <Stat label="Cities reached" value={cities} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Latest applications" actions={<Link href="/admin/job-seekers" className="text-sm text-orange">View all</Link>}>
              {seekers.length === 0 ? (
                <Empty />
              ) : (
                <ul className="divide-y divide-[var(--gray-100)]">
                  {seekers.slice(0, 5).map((s) => (
                    <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-navy truncate">{s.fullName}</div>
                        <div className="text-xs text-[var(--gray-400)]">{s.position} · {formatDate(s.createdAt)}</div>
                      </div>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Latest business requests" actions={<Link href="/admin/employers" className="text-sm text-orange">View all</Link>}>
              {employers.length === 0 ? (
                <Empty />
              ) : (
                <ul className="divide-y divide-[var(--gray-100)]">
                  {employers.slice(0, 5).map((s) => (
                    <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-navy truncate">{s.businessName}</div>
                        <div className="text-xs text-[var(--gray-400)]">{s.staffType} × {s.staffCount} · {formatDate(s.createdAt)}</div>
                      </div>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {user.role === "admin" && (
            <Card title="Quick actions">
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/admin/content" className="px-4 py-2 rounded-lg bg-orange/10 text-orange font-medium hover:bg-orange/20">
                  Edit website content
                </Link>
                <Link href="/admin/users" className="px-4 py-2 rounded-lg bg-navy/5 text-navy font-medium hover:bg-navy/10">
                  Manage team access
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: number; sub?: string; href?: string }) {
  const body = (
    <div className="bg-white rounded-xl p-4 border border-[var(--gray-100)] h-full hover:shadow-md transition-shadow">
      <div className="text-3xl font-bold text-navy">{value}</div>
      <div className="text-sm text-[var(--gray-500)] mt-1">{label}</div>
      {sub && <div className="text-xs text-[var(--gray-400)] mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Empty() {
  return <p className="text-sm text-[var(--gray-400)] py-6 text-center">Nothing yet</p>;
}
