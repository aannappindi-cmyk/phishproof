"use client";

import { useState } from "react";
import type { Scenario, Flaggable } from "@/lib/ai";

type Props = { scamTypes: Record<string, string>; plan: string };
type Feedback = { kind: "hit" | "safe" | "repeat"; text: string } | null;

const LOADING_LINES = [
  "Studying how scammers target your club…",
  "Writing a convincing fake message…",
  "Hiding the red flags…",
];

export default function Practice({ scamTypes, plan }: Props) {
  const [form, setForm] = useState({
    school: "",
    club: "",
    scamType: Object.keys(scamTypes)[0],
    channel: "email",
    difficulty: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const [error, setError] = useState("");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [clicked, setClicked] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [revealed, setRevealed] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setScenario(null);
    setClicked(new Set());
    setFeedback(null);
    setRevealed(false);
    setLoadingLine(0);
    const timer = setInterval(() => setLoadingLine((n) => Math.min(n + 1, LOADING_LINES.length - 1)), 3500);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setScenario(data.scenario);
      setRemaining(data.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  const parts: [string, Flaggable][] = scenario
    ? [
        ["from", scenario.from],
        ...(scenario.channel === "email" && scenario.subject.text ? [["subject", scenario.subject] as [string, Flaggable]] : []),
        ...scenario.body.map((b, i) => [`b${i}`, b] as [string, Flaggable]),
      ]
    : [];
  const flags = parts.filter(([, p]) => p.is_red_flag);
  const found = flags.filter(([k]) => clicked.has(k)).length;

  function click(key: string, part: Flaggable) {
    if (revealed) return;
    if (clicked.has(key)) {
      setFeedback({ kind: "repeat", text: part.is_red_flag ? part.explanation : "You already checked this part. It looks normal." });
      return;
    }
    const next = new Set(clicked);
    next.add(key);
    setClicked(next);
    setFeedback(
      part.is_red_flag
        ? { kind: "hit", text: part.explanation }
        : { kind: "safe", text: "Not a red flag. This part looks normal. Keep looking!" }
    );
    if (part.is_red_flag && flags.filter(([k]) => next.has(k)).length === flags.length) setRevealed(true);
  }

  function segClass(key: string, part: Flaggable) {
    if (part.is_red_flag && clicked.has(key)) return "seg found";
    if (part.is_red_flag && revealed) return "seg missed";
    if (clicked.has(key)) return "seg safe";
    return "seg";
  }

  const seg = (key: string, part: Flaggable) => (
    <span key={key} className={segClass(key, part)} onClick={() => click(key, part)}>
      {part.text}
    </span>
  );

  return (
    <>
      <form className="card" onSubmit={generate}>
        <div className="form-grid">
          <div>
            <label htmlFor="school">Your school</label>
            <input id="school" required maxLength={80} placeholder="e.g. Ohio State University"
              value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
          </div>
          <div>
            <label htmlFor="club">Your club or organization</label>
            <input id="club" required maxLength={80} placeholder="e.g. Indian Students Association"
              value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} />
          </div>
          <div>
            <label htmlFor="scamType">Scam to practice</label>
            <select id="scamType" value={form.scamType} onChange={(e) => setForm({ ...form, scamType: e.target.value })}>
              {Object.entries(scamTypes).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="channel">Message type</label>
            <select id="channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="email">Email</option>
              <option value="text">Text message</option>
            </select>
          </div>
          <div>
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn big" type="submit" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? LOADING_LINES[loadingLine] : scenario ? "Generate another scam" : "Generate my practice scam"}
        </button>
        {remaining !== null && plan !== "pro" && (
          <p className="hint">{remaining} free practice {remaining === 1 ? "scam" : "scams"} left today.</p>
        )}
      </form>

      {scenario && (
        <>
          <div className={`message ${scenario.channel === "text" ? "sms" : ""}`}>
            <div className="message-head">
              <div><b>From:</b> {seg("from", scenario.from)}</div>
              {scenario.channel === "email" && scenario.subject.text && (
                <div><b>Subject:</b> {seg("subject", scenario.subject)}</div>
              )}
            </div>
            <div className="message-body">{scenario.body.map((b, i) => seg(`b${i}`, b))}</div>
            <div className="feedback">
              <div className="score">
                {revealed && found === flags.length
                  ? `🎉 You found all ${flags.length} red flags!`
                  : `${found} / ${flags.length} red flags found`}
              </div>
              {feedback && !revealed && (
                <p className={feedback.kind === "safe" ? "bad" : "good"}>
                  {feedback.kind === "hit" ? "🚩 Red flag! " : ""}
                  {feedback.text}
                </p>
              )}
              {!feedback && !revealed && <p className="bad">Click any part of the message that looks suspicious.</p>}
              {!revealed && (
                <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setRevealed(true)}>
                  I&apos;m done, show me the answers
                </button>
              )}
            </div>
          </div>

          {revealed && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>All the red flags</h3>
              <ul className="flag-list">
                {flags.map(([k, p]) => (
                  <li key={k}>
                    {clicked.has(k) ? "✅" : "⚠️ Missed:"} <strong>&ldquo;{p.text.trim()}&rdquo;</strong>
                    <br />
                    <span style={{ color: "var(--muted)" }}>{p.explanation}</span>
                  </li>
                ))}
              </ul>
              <p style={{ marginBottom: 0 }}>
                <strong>Remember:</strong> {scenario.takeaway}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
