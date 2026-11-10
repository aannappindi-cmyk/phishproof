import Link from "next/link";
import Nav, { Footer } from "@/components/Nav";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SCAM_TYPES, type ScamType } from "@/lib/ai";

export default async function Dashboard() {
  const user = await requireUser();
  const pool = await db();
  const { rows: recent } = await pool.query<{
    id: number;
    club: string;
    scam_type: ScamType;
    channel: string;
    difficulty: string;
    created_at: Date;
  }>(
    `SELECT id, club, scam_type, channel, difficulty, created_at FROM scenarios
      WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [user.id]
  );
  const { rows: totals } = await pool.query<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM scenarios WHERE user_id = $1",
    [user.id]
  );
  const isPro = user.plan === "pro";

  return (
    <>
      <Nav />
      <main className="wrap">
        <section>
          <h1 style={{ margin: "0 0 6px" }}>Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="sub">
            {user.email} · <span className={`badge ${isPro ? "pro" : "free"}`}>{isPro ? "Club Pro" : "Free plan"}</span>
          </p>

          <div className="grid">
            <div className="card">
              <div className="icon">🎣</div>
              <h3>Practice spotting a scam</h3>
              <p>Get a fresh AI-written phishing email or text made for your club, then find the red flags.</p>
              <Link href="/practice" className="btn" style={{ marginTop: 14 }}>Start a practice round</Link>
            </div>
            <div className="card">
              <div className="icon">📈</div>
              <h3>Your practice so far</h3>
              <p>
                <strong style={{ fontSize: "1.8rem", color: "var(--text)" }}>{totals[0].n}</strong> practice{" "}
                {totals[0].n === 1 ? "scam" : "scams"} completed
              </p>
              <p style={{ marginTop: 8 }}>
                {isPro ? "Club Pro: unlimited practice." : "Free plan: 3 AI practice scams per day."}
              </p>
            </div>
            {!isPro && (
              <div className="card featured">
                <div className="icon">⭐</div>
                <h3>Upgrade to Club Pro</h3>
                <p>Unlimited practice for your whole club for $29/month. Online checkout is coming soon.</p>
              </div>
            )}
          </div>
        </section>

        {recent.length > 0 && (
          <section>
            <h2>Recent practice</h2>
            <div className="card">
              {recent.map((s) => (
                <div key={s.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <strong>{SCAM_TYPES[s.scam_type] ?? s.scam_type}</strong>
                  <span style={{ color: "var(--muted)" }}>
                    {" "}· {s.club} · {s.channel} · {s.difficulty} · {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
