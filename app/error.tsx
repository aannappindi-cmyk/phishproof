"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap">
      <div className="auth card" style={{ marginTop: 80 }}>
        <h1>Something went wrong</h1>
        <p className="sub">
          PhishProof hit a problem loading this page. Please try again in a moment.
        </p>
        <div className="cta-row">
          <button className="btn" onClick={() => reset()}>Try again</button>
          <Link href="/" className="btn ghost">Go home</Link>
        </div>
        <p className="hint">
          Site owner? Open <a href="/api/health">/api/health</a> to check the setup.
        </p>
      </div>
    </main>
  );
}
