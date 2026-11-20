"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminUserProvider, api, type AdminSessionUser } from "./ui";

const NAV = [
  { href: "/admin", label: "Dashboard", adminOnly: false },
  { href: "/admin/job-seekers", label: "Job Seekers", adminOnly: false },
  { href: "/admin/employers", label: "Business Requests", adminOnly: false },
  { href: "/admin/content", label: "Site Content", adminOnly: true },
  { href: "/admin/users", label: "Team & Access", adminOnly: true },
  { href: "/admin/account", label: "My Account", adminOnly: false },
];

export default function AdminFrame({ user, children }: { user: AdminSessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.adminOnly || user.role === "admin");

  async function logout() {
    await api("/api/admin/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-orange text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <AdminUserProvider value={user}>
      <div className="min-h-screen bg-[var(--gray-50)] lg:flex">
        <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-navy text-white sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
            <Image src="/logo.png" alt="" width={36} height={36} className="w-9 h-9" />
            <div>
              <div className="font-bold text-sm leading-tight">BARISTA JOB&apos;S</div>
              <div className="text-xs text-orange">Admin Panel</div>
            </div>
          </div>
          {nav}
          <SidebarFooter user={user} onLogout={logout} />
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden bg-navy text-white flex items-center justify-between px-4 h-14 sticky top-0 z-30">
            <span className="font-bold text-sm">
              BARISTA JOB&apos;S <span className="text-orange font-medium">Admin</span>
            </span>
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </header>
          {open && (
            <div className="lg:hidden bg-navy text-white sticky top-14 z-30 border-t border-white/10">
              {nav}
              <SidebarFooter user={user} onLogout={logout} />
            </div>
          )}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
        </div>
      </div>
    </AdminUserProvider>
  );
}

function SidebarFooter({ user, onLogout }: { user: AdminSessionUser; onLogout: () => void }) {
  return (
    <div className="px-4 py-4 border-t border-white/10 text-sm">
      <div className="font-medium truncate">{user.name}</div>
      <div className="text-xs text-white/50 truncate">
        {user.email} · {user.role === "admin" ? "Admin" : "Staff"}
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-orange">
          View site ↗
        </a>
        <button onClick={onLogout} className="text-white/70 hover:text-orange">
          Sign out
        </button>
      </div>
    </div>
  );
}
