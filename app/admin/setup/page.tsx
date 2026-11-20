import { Suspense } from "react";
import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/users";
import SetupForm from "./setup-form";

async function Gate() {
  if (await hasAnyUser()) redirect("/admin/login");
  return <SetupForm needsKey={Boolean(process.env.SETUP_KEY)} />;
}

export default function SetupPage() {
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}
