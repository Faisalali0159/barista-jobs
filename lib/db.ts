import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

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
  createdAt: string;
}

export interface Employer {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  city: string;
  staffType: string;
  staffCount: number;
  experienceRequired?: string;
  details?: string;
  createdAt: string;
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filename: string): Promise<T[]> {
  await ensureDir();
  const filepath = join(DATA_DIR, filename);
  try {
    const content = await readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  await ensureDir();
  const filepath = join(DATA_DIR, filename);
  await writeFile(filepath, JSON.stringify(data, null, 2));
}

export async function getJobSeekers(): Promise<JobSeeker[]> {
  return readJson<JobSeeker>("job-seekers.json");
}

export async function addJobSeeker(seeker: JobSeeker): Promise<void> {
  const seekers = await getJobSeekers();
  seekers.unshift(seeker);
  await writeJson("job-seekers.json", seekers);
}

export async function getEmployers(): Promise<Employer[]> {
  return readJson<Employer>("employers.json");
}

export async function addEmployer(employer: Employer): Promise<void> {
  const employers = await getEmployers();
  employers.unshift(employer);
  await writeJson("employers.json", employers);
}
