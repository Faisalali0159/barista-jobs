import { addJobSeeker, getJobSeekers } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const city = formData.get("city") as string;
    const position = formData.get("position") as string;
    const experience = formData.get("experience") as string;
    const message = formData.get("message") as string;

    if (!fullName || !phone || !city || !position || !experience) {
      return Response.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    let cvPath: string | undefined;
    const cv = formData.get("cv") as File | null;
    if (cv && cv.size > 0) {
      const ext = cv.name.split(".").pop();
      const filename = `cv-${id}.${ext}`;
      const bytes = new Uint8Array(await cv.arrayBuffer());
      await writeFile(join(uploadsDir, filename), bytes);
      cvPath = `/uploads/${filename}`;
    }

    let photoPath: string | undefined;
    const photo = formData.get("photo") as File | null;
    if (photo && photo.size > 0) {
      const ext = photo.name.split(".").pop();
      const filename = `photo-${id}.${ext}`;
      const bytes = new Uint8Array(await photo.arrayBuffer());
      await writeFile(join(uploadsDir, filename), bytes);
      photoPath = `/uploads/${filename}`;
    }

    await addJobSeeker({
      id,
      fullName,
      phone,
      city,
      position,
      experience,
      cvPath,
      photoPath,
      message: message || undefined,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true, id });
  } catch (err) {
    console.error("Job seeker submission error:", err);
    return Response.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const seekers = await getJobSeekers();
    return Response.json(seekers);
  } catch (err) {
    console.error("Job seekers fetch error:", err);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
