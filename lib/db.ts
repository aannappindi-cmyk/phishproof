import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Neon (added through Vercel) provides DATABASE_URL automatically. If a custom
// prefix was chosen during setup (e.g. STORAGE_DATABASE_URL), find that too.
export function findDatabaseEnvName(): string | undefined {
  const preferred = ["DATABASE_URL", "POSTGRES_URL"];
  for (const name of preferred) if (process.env[name]) return name;
  return Object.keys(process.env)
    .sort()
    .find((k) => /_(DATABASE_URL|POSTGRES_URL)$/.test(k) && process.env[k]);
}
const dbEnvName = findDatabaseEnvName();
const connectionString = dbEnvName ? process.env[dbEnvName] : undefined;

const globalForDb = globalThis as unknown as { pool?: Pool; schemaReady?: Promise<void> };

function getPool(): Pool {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add a Neon database to the Vercel project.");
  }
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({ connectionString, max: 5 });
  }
  return globalForDb.pool;
}

export const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "password123!";

// Creates the tables (if missing) and makes sure the demo account exists.
// Runs once per server instance, so no manual database setup is needed.
async function setupSchema(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS scenarios (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      school TEXT NOT NULL,
      club TEXT NOT NULL,
      scam_type TEXT NOT NULL,
      channel TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      content JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS scenarios_user_created ON scenarios (user_id, created_at);
  `);

  // Demo account: full paid access, email already verified.
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (email, name, password_hash, plan, email_verified)
     VALUES ($1, 'Demo User', $2, 'pro', TRUE)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, plan = 'pro', email_verified = TRUE`,
    [DEMO_EMAIL, demoHash]
  );
}

export async function db(): Promise<Pool> {
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = setupSchema().catch((err) => {
      globalForDb.schemaReady = undefined; // retry on next request
      throw err;
    });
  }
  await globalForDb.schemaReady;
  return getPool();
}
