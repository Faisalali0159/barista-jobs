import { db, withTx } from "./pg";

export type JobSeekerStatus = "new" | "contacted" | "shortlisted" | "placed" | "rejected";
export type EmployerStatus = "new" | "contacted" | "in-progress" | "completed" | "rejected";

export const JOB_SEEKER_STATUSES: JobSeekerStatus[] = [
  "new",
  "contacted",
  "shortlisted",
  "placed",
  "rejected",
];
export const EMPLOYER_STATUSES: EmployerStatus[] = [
  "new",
  "contacted",
  "in-progress",
  "completed",
  "rejected",
];

export interface JobSeeker {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  position: string;
  experience: string;
  cvPath?: string;
  photoPath?: string;
  message?: string;
  status?: JobSeekerStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Employer {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  city: string;
  services: string[];
  staffType: string;
  staffCount: number;
  experienceRequired?: string;
  details?: string;
  status?: EmployerStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RecordKind = "job-seekers" | "employers";

export function isRecordKind(value: string): value is RecordKind {
  return value === "job-seekers" || value === "employers";
}

export function allowedStatuses(kind: RecordKind): string[] {
  return kind === "job-seekers" ? JOB_SEEKER_STATUSES : EMPLOYER_STATUSES;
}

async function listRecords<T>(kind: RecordKind): Promise<T[]> {
  const { rows } = await (await db()).query(
    "SELECT data FROM records WHERE kind = $1 ORDER BY created_at DESC",
    [kind]
  );
  return rows.map((r) => r.data as T);
}

async function insertRecord(kind: RecordKind, rec: JobSeeker | Employer): Promise<void> {
  await (await db()).query(
    "INSERT INTO records (kind, id, data, created_at) VALUES ($1, $2, $3, $4)",
    [kind, rec.id, JSON.stringify(rec), rec.createdAt]
  );
}

export async function getJobSeekers(): Promise<JobSeeker[]> {
  const rows = await listRecords<JobSeeker>("job-seekers");
  return rows.map((r) => ({ ...r, status: r.status ?? "new" }));
}

export async function addJobSeeker(seeker: JobSeeker): Promise<void> {
  await insertRecord("job-seekers", { ...seeker, status: seeker.status ?? "new" });
}

export async function getEmployers(): Promise<Employer[]> {
  const rows = await listRecords<Employer>("employers");
  return rows.map((r) => ({ ...r, status: r.status ?? "new", services: r.services ?? [] }));
}

export async function addEmployer(employer: Employer): Promise<void> {
  await insertRecord("employers", { ...employer, status: employer.status ?? "new" });
}

/** Update status/notes of a record. Returns the updated record or null. */
export async function patchRecord(
  kind: RecordKind,
  id: string,
  patch: { status?: string; notes?: string }
): Promise<(JobSeeker | Employer) | null> {
  return withTx(`records:${kind}:${id}`, async (c) => {
    const found = await c.query("SELECT data FROM records WHERE kind = $1 AND id = $2", [kind, id]);
    if (!found.rows.length) return null;
    const updated = { ...found.rows[0].data, updatedAt: new Date().toISOString() } as JobSeeker & Employer;
    if (patch.status !== undefined) updated.status = patch.status as never;
    if (patch.notes !== undefined) updated.notes = patch.notes || undefined;
    await c.query("UPDATE records SET data = $3 WHERE kind = $1 AND id = $2", [
      kind,
      id,
      JSON.stringify(updated),
    ]);
    return updated;
  });
}

/** Deletes a record and returns it (so attached files can be cleaned up). */
export async function deleteRecord(
  kind: RecordKind,
  id: string
): Promise<(JobSeeker | Employer) | null> {
  const { rows } = await (await db()).query(
    "DELETE FROM records WHERE kind = $1 AND id = $2 RETURNING data",
    [kind, id]
  );
  return rows.length ? (rows[0].data as JobSeeker | Employer) : null;
}
