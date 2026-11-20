import { db } from "./pg";

// Uploads are stored in Postgres and only reachable through the authenticated
// /api/admin/files/[name] route.

const ALLOWED: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function extensionFor(filename: string, kind: "cv" | "photo"): string | null {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!(ext in ALLOWED)) return null;
  if (kind === "photo" && !["jpg", "jpeg", "png", "webp"].includes(ext)) return null;
  return ext;
}

export function isSafeUploadName(name: string): boolean {
  return /^(cv|photo)-[0-9a-f-]{36}\.(pdf|doc|docx|jpg|jpeg|png|webp)$/.test(name);
}

export function mimeFor(name: string): string {
  return ALLOWED[name.split(".").pop() ?? ""] ?? "application/octet-stream";
}

/** URL a stored file is served from (admin only). */
export function uploadUrl(name: string): string {
  return `/api/admin/files/${name}`;
}

/** Extracts the stored filename from a cvPath/photoPath (new or legacy format). */
export function uploadNameFromPath(p: string): string | null {
  const name = p.split("/").pop() ?? "";
  return isSafeUploadName(name) ? name : null;
}

export async function putUpload(name: string, data: Uint8Array): Promise<void> {
  await (await db()).query(
    "INSERT INTO uploads (name, mime, data) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, mime = EXCLUDED.mime",
    [name, mimeFor(name), Buffer.from(data)]
  );
}

export async function getUpload(name: string): Promise<{ mime: string; data: Buffer } | null> {
  const { rows } = await (await db()).query("SELECT mime, data FROM uploads WHERE name = $1", [name]);
  return rows.length ? { mime: rows[0].mime, data: rows[0].data } : null;
}

export async function deleteUpload(name: string): Promise<void> {
  await (await db()).query("DELETE FROM uploads WHERE name = $1", [name]);
}
