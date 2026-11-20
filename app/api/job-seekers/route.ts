import { addJobSeeker, getJobSeekers } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSiteContentFresh } from "@/lib/content";
import { MAX_UPLOAD_BYTES, UPLOADS_DIR, extensionFor, uploadUrl } from "@/lib/uploads";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const clip = (v: FormDataEntryValue | null, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const content = await getSiteContentFresh();
    if (!content.forms.jobSeekersOpen) {
      return Response.json(
        { error: "Applications are currently closed" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const fullName = clip(formData.get("fullName"), 120);
    const phone = clip(formData.get("phone"), 40);
    const city = clip(formData.get("city"), 80);
    const position = clip(formData.get("position"), 120);
    const experience = clip(formData.get("experience"), 120);
    const message = clip(formData.get("message"), 3000);

    if (!fullName || !phone || !city || !position || !experience) {
      return Response.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    async function saveUpload(field: "cv" | "photo"): Promise<string | undefined | Response> {
      const file = formData.get(field);
      if (!(file instanceof File) || file.size === 0) return undefined;
      if (file.size > MAX_UPLOAD_BYTES) {
        return Response.json({ error: "Files must be 5MB or smaller" }, { status: 400 });
      }
      const ext = extensionFor(file.name, field);
      if (!ext) {
        return Response.json(
          { error: field === "cv" ? "CV must be a PDF, DOC or DOCX file" : "Photo must be a JPG, PNG or WebP image" },
          { status: 400 }
        );
      }
      await mkdir(UPLOADS_DIR, { recursive: true });
      const filename = `${field}-${id}.${ext}`;
      await writeFile(join(UPLOADS_DIR, filename), new Uint8Array(await file.arrayBuffer()));
      return uploadUrl(filename);
    }

    const cvPath = await saveUpload("cv");
    if (cvPath instanceof Response) return cvPath;
    const photoPath = await saveUpload("photo");
    if (photoPath instanceof Response) return photoPath;

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
      status: "new",
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

export async function GET(request: Request) {
  const auth = await requireAdmin(request, "records:read");
  if ("error" in auth) return auth.error;
  try {
    return Response.json(await getJobSeekers());
  } catch (err) {
    console.error("Job seekers fetch error:", err);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
