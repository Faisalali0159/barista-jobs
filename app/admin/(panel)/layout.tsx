import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { hasAnyUser } from "@/lib/users";
import AdminFrame from "../_components/admin-frame";

async function Gate({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect((await hasAnyUser()) ? "/admin/login" : "/admin/setup");
  }
  return (
    <AdminFrame user={{ id: user.id, name: user.name, username: user.username, role: user.role }}>
      {children}
    </AdminFrame>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--gray-50)]" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
