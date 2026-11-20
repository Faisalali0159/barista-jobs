"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Field, api, btnPrimary, inputCls } from "../_components/ui";

export default function SetupForm({ needsKey }: { needsKey: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/auth/setup", {
        method: "POST",
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          setupKey: fd.get("setupKey") || undefined,
        }),
      });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <Image src="/logo.png" alt="Barista Job's" width={56} height={56} className="w-14 h-14 mb-3" />
          <h1 className="text-xl font-bold text-navy">Create the first admin</h1>
          <p className="text-sm text-[var(--gray-500)]">
            This account has full access. You can add team members later from the panel.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert kind="error">{error}</Alert>}
          <Field label="Full name">
            <input name="name" required className={inputCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required autoComplete="username" className={inputCls} />
          </Field>
          <Field label="Password" hint="At least 8 characters">
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          </Field>
          <Field label="Confirm password">
            <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          </Field>
          {needsKey && (
            <Field label="Setup key" hint="The SETUP_KEY configured on the server">
              <input name="setupKey" type="password" required className={inputCls} />
            </Field>
          )}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
            {busy ? "Creating..." : "Create admin account"}
          </button>
        </form>
      </div>
    </div>
  );
}
