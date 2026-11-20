import { readFile, writeFile, mkdir, rename } from "fs/promises";
import { join } from "path";

export const DATA_DIR = join(process.cwd(), "data");

// Serialises writes per file so concurrent requests cannot clobber each other.
const queues = new Map<string, Promise<unknown>>();

function enqueue<T>(file: string, task: () => Promise<T>): Promise<T> {
  const prev = queues.get(file) ?? Promise.resolve();
  const next = prev.then(task, task);
  queues.set(
    file,
    next.catch(() => undefined)
  );
  return next;
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function atomicWrite(filename: string, data: unknown) {
  await mkdir(DATA_DIR, { recursive: true });
  const target = join(DATA_DIR, filename);
  const tmp = `${target}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2));
  await rename(tmp, target);
}

/** Read-modify-write under a per-file lock. */
export function updateJsonFile<T, R = void>(
  filename: string,
  fallback: T,
  mutate: (current: T) => { next: T; result: R } | Promise<{ next: T; result: R }>
): Promise<R> {
  return enqueue(filename, async () => {
    const current = await readJsonFile<T>(filename, fallback);
    const { next, result } = await mutate(current);
    await atomicWrite(filename, next);
    return result;
  });
}
