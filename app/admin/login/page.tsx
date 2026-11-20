import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { hasAnyUser } from "@/lib/users";
import LoginForm from "./login-form";

async function Gate() {
  if (await getSessionUser()) redirect("/admin");
  if (!(await hasAnyUser())) redirect("/admin/setup");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}
