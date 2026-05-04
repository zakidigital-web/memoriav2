import { getEnv } from "./env";
import { Pool } from "pg";

type QueryResultRow = Record<string, unknown>;

declare global {
  var __memoriaPool: Pool | undefined;
}

function getPool() {
  if (globalThis.__memoriaPool) return globalThis.__memoriaPool;
  const { DATABASE_URL } = getEnv();
  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  globalThis.__memoriaPool = pool;
  return pool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
  opts?: { timeoutMs?: number }
): Promise<T[]> {
  const timeoutMs = opts?.timeoutMs ?? 8_000;
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = $1", [timeoutMs]);
    const result = await client.query(text, params as any[]);
    await client.query("COMMIT");
    return result.rows as T[];
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw e;
  } finally {
    client.release();
  }
}

export async function dbQueryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
  opts?: { timeoutMs?: number }
): Promise<T | null> {
  const rows = await dbQuery<T>(text, params, opts);
  return rows[0] ?? null;
}
