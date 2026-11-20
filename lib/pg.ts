import { Pool, neonConfig, type PoolClient } from "@neondatabase/serverless";
import ws from "ws";
import { readFile } from "fs/promises";
import { join } from "path";

// Node < 22 has no global WebSocket; the Neon driver needs one for Pool/transactions.
neonConfig.webSocketConstructor = ws;

const g = globalThis as unknown as { __neonPool?: Pool; __schemaReady?: Promise<void> };

function pool(): Pool {
  if (!g.__neonPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local");
    }
    g.__neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return g.__neonPool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS records (
     kind text NOT NULL,
     id text NOT NULL,
     data jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now(),
     PRIMARY KEY (kind, id)
   )`,
  `CREATE INDEX IF NOT EXISTS records_kind_created_idx ON records (kind, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS admin_users (
     id text PRIMARY KEY,
     email text NOT NULL UNIQUE,
     data jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS uploads (
     name text PRIMARY KEY,
     mime text NOT NULL,
     data bytea NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

async function readLegacy<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(join(process.cwd(), "data", file), "utf-8")) as T;
  } catch {
    return null;
  }
}

/** Creates tables, then imports any pre-existing JSON data once (only into empty tables). */
async function init(): Promise<void> {
  const p = pool();
  for (const stmt of SCHEMA) await p.query(stmt);

  for (const [kind, file] of [
    ["job-seekers", "job-seekers.json"],
    ["employers", "employers.json"],
  ] as const) {
    const { rows } = await p.query("SELECT 1 FROM records WHERE kind = $1 LIMIT 1", [kind]);
    if (rows.length) continue;
    const legacy = await readLegacy<Array<{ id: string; createdAt?: string }>>(file);
    for (const r of legacy ?? []) {
      await p.query(
        "INSERT INTO records (kind, id, data, created_at) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING",
        [kind, r.id, JSON.stringify(r), r.createdAt ?? new Date().toISOString()]
      );
    }
  }

  const users = await p.query("SELECT 1 FROM admin_users LIMIT 1");
  if (!users.rows.length) {
    const legacy = await readLegacy<Array<{ id: string; email: string; createdAt?: string }>>("admin-users.json");
    for (const u of legacy ?? []) {
      await p.query(
        "INSERT INTO admin_users (id, email, data, created_at) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING",
        [u.id, u.email, JSON.stringify(u), u.createdAt ?? new Date().toISOString()]
      );
    }
  }

  const content = await p.query("SELECT 1 FROM kv WHERE key = 'site-content'");
  if (!content.rows.length) {
    const legacy = await readLegacy<unknown>("site-content.json");
    if (legacy) {
      await p.query("INSERT INTO kv (key, value) VALUES ('site-content', $1) ON CONFLICT DO NOTHING", [
        JSON.stringify(legacy),
      ]);
    }
  }
}

/** Returns the pool after making sure the schema exists. */
export async function db(): Promise<Pool> {
  if (!g.__schemaReady) {
    g.__schemaReady = init().catch((err) => {
      g.__schemaReady = undefined; // retry next time
      throw err;
    });
  }
  await g.__schemaReady;
  return pool();
}

/** Runs fn inside a transaction; `lockKey` serialises concurrent callers. */
export async function withTx<T>(lockKey: string, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await (await db()).connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockKey]);
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const { rows } = await (await db()).query("SELECT value FROM kv WHERE key = $1", [key]);
  return rows.length ? (rows[0].value as T) : fallback;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await (await db()).query(
    "INSERT INTO kv (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [key, JSON.stringify(value)]
  );
}
