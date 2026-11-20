"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface AdminSessionUser {
  id: string;
  name: string;
  username: string;
  role: "admin" | "staff";
}

const UserContext = createContext<AdminSessionUser | null>(null);
export const AdminUserProvider = UserContext.Provider;

export function useAdminUser(): AdminSessionUser {
  const u = useContext(UserContext);
  if (!u) throw new Error("useAdminUser must be used inside the admin panel");
  return u;
}

/** fetch wrapper that returns parsed JSON and throws Error(message) on failure. */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.includes("/auth/")) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login");
  }
  if (!res.ok) throw new Error((data as { error?: string }).error || "Something went wrong");
  return data as T;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-[var(--gray-200)] bg-white text-sm text-navy placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange";
export const btnPrimary =
  "inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-orange hover:bg-orange-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnGhost =
  "inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[var(--gray-200)] bg-white hover:bg-[var(--gray-50)] text-navy text-sm font-medium transition-colors disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center justify-center px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[var(--gray-400)] mt-1">{hint}</span>}
    </label>
  );
}

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-[var(--gray-100)] shadow-sm">
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-3">
          <div>
            {title && <h2 className="font-bold text-navy">{title}</h2>}
            {description && <p className="text-sm text-[var(--gray-500)] mt-0.5">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="px-5 sm:px-6 pb-5 pt-2">{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--gray-500)] mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg px-4 py-3 text-sm ${
        kind === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
      }`}
    >
      {children}
    </div>
  );
}

/** Transient message. */
export function useFlash() {
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);
  return {
    flash: msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : null,
    ok: (text: string) => setMsg({ kind: "success", text }),
    fail: (text: string) => setMsg({ kind: "error", text }),
  };
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-blue-50 text-blue-700",
    contacted: "bg-amber-50 text-amber-700",
    shortlisted: "bg-purple-50 text-purple-700",
    "in-progress": "bg-purple-50 text-purple-700",
    placed: "bg-green-50 text-green-700",
    completed: "bg-green-50 text-green-700",
    rejected: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? map.new}`}>
      {status.replace("-", " ")}
    </span>
  );
}
