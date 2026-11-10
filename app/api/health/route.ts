import { NextResponse } from "next/server";
import { db, findDatabaseEnvName } from "@/lib/db";

export const dynamic = "force-dynamic";

// Setup check for the site owner. Shows what is configured, never any secret values.
export async function GET() {
  const dbEnv = findDatabaseEnvName();
  let database: string;
  if (!dbEnv) {
    database = "NOT CONNECTED: no DATABASE_URL found. Connect Neon in Vercel (Storage tab), then redeploy.";
  } else {
    try {
      const pool = await db();
      const { rows } = await pool.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM users");
      database = `OK: connected using ${dbEnv}, ${rows[0].n} users in the users table.`;
    } catch (err) {
      database = `ERROR using ${dbEnv}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  const ai = process.env.ANTHROPIC_API_KEY
    ? "OK: ANTHROPIC_API_KEY is set."
    : "NOT SET: add ANTHROPIC_API_KEY in Vercel Settings > Environment Variables, then redeploy.";
  return NextResponse.json({ database, ai_key: ai });
}
