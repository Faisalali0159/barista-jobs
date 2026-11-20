import { addEmployer, getEmployers } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSiteContentFresh } from "@/lib/content";

const clip = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const content = await getSiteContentFresh();
    if (!content.forms.employersOpen) {
      return Response.json(
        { error: "Requests are currently closed" },
        { status: 403 }
      );
    }

    const data = await request.json();

    const businessName = clip(data.businessName, 160);
    const contactPerson = clip(data.contactPerson, 120);
    const phone = clip(data.phone, 40);
    const city = clip(data.city, 80);
    const staffType = clip(data.staffType, 120);
    const staffCount = Number(data.staffCount);
    const experienceRequired = clip(data.experienceRequired, 120);
    const details = clip(data.details, 3000);
    const services = Array.isArray(data.services)
      ? data.services.filter((s: unknown): s is string => typeof s === "string").map((s: string) => s.slice(0, 120)).slice(0, 30)
      : [];

    if (!businessName || !contactPerson || !phone || !city || !staffType || !Number.isFinite(staffCount) || staffCount < 1) {
      return Response.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await addEmployer({
      id,
      businessName,
      contactPerson,
      phone,
      city,
      services,
      staffType,
      staffCount: Math.floor(staffCount),
      experienceRequired: experienceRequired || undefined,
      details: details || undefined,
      status: "new",
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true, id });
  } catch (err) {
    console.error("Employer submission error:", err);
    return Response.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request, "records:read");
  if ("error" in auth) return auth.error;
  try {
    return Response.json(await getEmployers());
  } catch (err) {
    console.error("Employers fetch error:", err);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
