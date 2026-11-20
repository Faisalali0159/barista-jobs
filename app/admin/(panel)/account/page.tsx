"use client";

import { Card, Field, PageHeader, api, btnPrimary, inputCls, useAdminUser, useFlash } from "../../_components/ui";

export default function AccountPage() {
  const user = useAdminUser();
  const { flash, ok, fail } = useFlash();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("newPassword") !== fd.get("confirm")) {
      fail("New passwords do not match");
      return;
    }
    try {
      await api("/api/admin/account/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: fd.get("currentPassword"), newPassword: fd.get("newPassword") }),
      });
      ok("Password changed. Other devices have been signed out.");
      form.reset();
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not change password");
    }
  }

  return (
    <>
      <PageHeader title="My Account" />
      <div className="space-y-4 max-w-xl">
        {flash}
        <Card title="Profile">
          <dl className="text-sm space-y-2">
            <div><dt className="inline text-[var(--gray-400)]">Name: </dt><dd className="inline font-medium text-navy">{user.name}</dd></div>
            <div><dt className="inline text-[var(--gray-400)]">Username: </dt><dd className="inline font-medium text-navy">{user.username}</dd></div>
            <div><dt className="inline text-[var(--gray-400)]">Role: </dt><dd className="inline font-medium text-navy capitalize">{user.role}</dd></div>
          </dl>
        </Card>
        <Card title="Change password">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Current password">
              <input name="currentPassword" type="password" required autoComplete="current-password" className={inputCls} />
            </Field>
            <Field label="New password" hint="At least 8 characters">
              <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
            </Field>
            <Field label="Confirm new password">
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
            </Field>
            <button type="submit" className={btnPrimary}>
              Update password
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
