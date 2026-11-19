import { addEmployer, getEmployers } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      businessName,
      contactPerson,
      phone,
      city,
      staffType,
      staffCount,
      experienceRequired,
      details,
    } = data;

    if (!businessName || !contactPerson || !phone || !city || !staffType || !staffCount) {
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
      staffType,
      staffCount: Number(staffCount),
      experienceRequired: experienceRequired || undefined,
      details: details || undefined,
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

export async function GET() {
  try {
    const employers = await getEmployers();
    return Response.json(employers);
  } catch (err) {
    console.error("Employers fetch error:", err);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
