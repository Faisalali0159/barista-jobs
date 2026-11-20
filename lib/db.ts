import { readJsonFile, updateJsonFile } from "./store";

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

const FILES: Record<RecordKind, string> = {
  "job-seekers": "job-seekers.json",
  employers: "employers.json",
};

export function isRecordKind(value: string): value is RecordKind {
  return value === "job-seekers" || value === "employers";
}

export function allowedStatuses(kind: RecordKind): string[] {
  return kind === "job-seekers" ? JOB_SEEKER_STATUSES : EMPLOYER_STATUSES;
}

export async function getJobSeekers(): Promise<JobSeeker[]> {
  const rows = await readJsonFile<JobSeeker[]>(FILES["job-seekers"], []);
  return rows.map((r) => ({ ...r, status: r.status ?? "new" }));
}

export async function addJobSeeker(seeker: JobSeeker): Promise<void> {
  await updateJsonFile<JobSeeker[]>(FILES["job-seekers"], [], (rows) => ({
    next: [{ ...seeker, status: seeker.status ?? "new" }, ...rows],
    result: undefined,
  }));
}

export async function getEmployers(): Promise<Employer[]> {
  const rows = await readJsonFile<Employer[]>(FILES.employers, []);
  return rows.map((r) => ({ ...r, status: r.status ?? "new", services: r.services ?? [] }));
}

export async function addEmployer(employer: Employer): Promise<void> {
  await updateJsonFile<Employer[]>(FILES.employers, [], (rows) => ({
    next: [{ ...employer, status: employer.status ?? "new" }, ...rows],
    result: undefined,
  }));
}

/** Update status/notes of a record. Returns the updated record or null. */
export async function patchRecord(
  kind: RecordKind,
  id: string,
  patch: { status?: string; notes?: string }
): Promise<(JobSeeker | Employer) | null> {
  return updateJsonFile<Array<JobSeeker | Employer>, (JobSeeker | Employer) | null>(
    FILES[kind],
    [],
    (rows) => {
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) return { next: rows, result: null };
      const updated = { ...rows[idx], updatedAt: new Date().toISOString() } as JobSeeker & Employer;
      if (patch.status !== undefined) updated.status = patch.status as never;
      if (patch.notes !== undefined) updated.notes = patch.notes || undefined;
      const next = [...rows];
      next[idx] = updated;
      return { next, result: updated };
    }
  );
}

/** Deletes a record and returns it (so attached files can be cleaned up). */
export async function deleteRecord(
  kind: RecordKind,
  id: string
): Promise<(JobSeeker | Employer) | null> {
  return updateJsonFile<Array<JobSeeker | Employer>, (JobSeeker | Employer) | null>(
    FILES[kind],
    [],
    (rows) => {
      const found = rows.find((r) => r.id === id) ?? null;
      return { next: rows.filter((r) => r.id !== id), result: found };
    }
  );
}
