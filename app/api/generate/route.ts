import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateScenario, SCAM_TYPES, type ScamType, type Difficulty } from "@/lib/ai";

export const maxDuration = 60;

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 50; // keeps AI costs bounded even on the paid plan

function clean(value: unknown, max: number): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const school = clean(body.school, 80);
  const club = clean(body.club, 80);
  const scamType = body.scamType as ScamType;
  const channel = body.channel === "text" ? "text" : "email";
  const difficulty: Difficulty = ["easy", "medium", "hard"].includes(body.difficulty) ? body.difficulty : "medium";

  if (!school || !club) return NextResponse.json({ error: "Enter your school and club name." }, { status: 400 });
  if (!(scamType in SCAM_TYPES)) return NextResponse.json({ error: "Pick a scam type." }, { status: 400 });

  const pool = await db();
  const { rows } = await pool.query<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM scenarios WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 day'",
    [user.id]
  );
  const limit = user.plan === "pro" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  if (rows[0].n >= limit) {
    return NextResponse.json(
      {
        error:
          user.plan === "pro"
            ? "You've hit today's practice limit. Come back tomorrow!"
            : `Free accounts get ${FREE_DAILY_LIMIT} practice scams per day. Upgrade to Club Pro for more.`,
      },
      { status: 429 }
    );
  }

  try {
    const scenario = await generateScenario({ school, club, scamType, channel, difficulty });
    await pool.query(
      `INSERT INTO scenarios (user_id, school, club, scam_type, channel, difficulty, content)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.id, school, club, scamType, channel, difficulty, JSON.stringify(scenario)]
    );
    return NextResponse.json({ scenario, remaining: limit - rows[0].n - 1 });
  } catch (err) {
    console.error("generate failed", err);
    const message =
      err instanceof Error && err.message.startsWith("The AI")
        ? err.message
        : "Something went wrong creating your practice scam. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
