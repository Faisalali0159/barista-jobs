"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Field,
  PageHeader,
  api,
  btnDanger,
  btnGhost,
  btnPrimary,
  formatDate,
  inputCls,
  useAdminUser,
  useFlash,
} from "../../_components/ui";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const me = useAdminUser();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [adding, setAdding] = useState(false);
  const { flash, ok, fail } = useFlash();

  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (me.role !== "admin") return;
    let cancelled = false;
    api<TeamUser[]>("/api/admin/users")
      .then((data) => !cancelled && setUsers(data))
      .catch((e) => !cancelled && fail(e instanceof Error ? e.message : "Failed to load"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.role, reloadKey]);

  if (me.role !== "admin") return <p className="text-[var(--gray-500)]">You do not have access to this page.</p>;

  async function patch(u: TeamUser, body: Record<string, unknown>, msg: string) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify(body) });
      ok(msg);
      load();
    } catch (e) {
      fail(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function remove(u: TeamUser) {
    if (!confirm(`Delete ${u.name}? They will lose access immediately.`)) return;
    try {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      ok("User deleted");
      load();
    } catch (e) {
      fail(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function resetPassword(u: TeamUser) {
    const pw = prompt(`New password for ${u.name} (min 8 characters):`);
    if (pw) await patch(u, { password: pw }, "Password reset. They have been signed out everywhere.");
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await api("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      ok("User created");
      form.reset();
      setAdding(false);
      load();
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not create user");
    }
  }

  return (
    <>
      <PageHeader
        title="Team & Access"
        subtitle="Admins can do everything. Staff can view and update applications, but cannot delete data, edit the site, or manage users."
        actions={
          <button onClick={() => setAdding(!adding)} className={btnPrimary}>
            {adding ? "Cancel" : "+ Add team member"}
          </button>
        }
      />
      <div className="space-y-4">
        {flash}
        {adding && (
          <Card title="New team member">
            <form onSubmit={add} className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <input name="name" required className={inputCls} />
              </Field>
              <Field label="Email">
                <input name="email" type="email" required className={inputCls} />
              </Field>
              <Field label="Temporary password" hint="At least 8 characters. Share it securely.">
                <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
              </Field>
              <Field label="Role">
                <select name="role" defaultValue="staff" className={inputCls}>
                  <option value="staff">Staff — manage applications</option>
                  <option value="admin">Admin — full access</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <button type="submit" className={btnPrimary}>
                  Create user
                </button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <ul className="divide-y divide-[var(--gray-100)]">
            {users.map((u) => {
              const self = u.id === me.id;
              return (
                <li key={u.id} className="py-4 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy">
                      {u.name} {self && <span className="text-xs text-[var(--gray-400)]">(you)</span>}
                      {!u.active && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Disabled</span>}
                    </div>
                    <div className="text-sm text-[var(--gray-500)] truncate">{u.email}</div>
                    <div className="text-xs text-[var(--gray-400)]">
                      {u.lastLoginAt ? `Last sign-in ${formatDate(u.lastLoginAt)}` : "Never signed in"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => patch(u, { role: e.target.value }, "Role updated")}
                      className={`${inputCls} w-28`}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                    <button className={btnGhost} onClick={() => resetPassword(u)}>
                      Reset password
                    </button>
                    {!self && (
                      <>
                        <button className={btnGhost} onClick={() => patch(u, { active: !u.active }, u.active ? "User disabled" : "User enabled")}>
                          {u.active ? "Disable" : "Enable"}
                        </button>
                        <button className={btnDanger} onClick={() => remove(u)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
