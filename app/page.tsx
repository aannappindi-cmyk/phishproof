import Link from "next/link";
import Nav, { Footer } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="wrap">
        <div className="hero">
          <div className="tag">Phishing awareness for college student organizations</div>
          <h1>
            Your members will get scammed. <em>Train them first.</em>
          </h1>
          <p className="lead">
            PhishProof uses AI to write realistic practice scams aimed at <strong>your</strong> school and{" "}
            <strong>your</strong> club: fake dues requests, fake internship offers, fake financial aid emails.
            Members click the red flags, get instant feedback, and learn to spot the real thing in a few minutes.
          </p>
          <div className="cta-row">
            <Link href="/signup" className="btn big">Start practicing free</Link>
            <Link href="/login" className="btn ghost big">Log in</Link>
          </div>
        </div>

        <section>
          <h2>Built for student organizations</h2>
          <p className="sub">For club officers who want to protect their members, and the members themselves.</p>
          <div className="grid">
            <div className="card">
              <div className="icon">🎯</div>
              <h3>Students are prime targets</h3>
              <p>New .edu inboxes, first jobs, financial aid refunds and Venmo dues make college students a favorite target for scammers.</p>
            </div>
            <div className="card">
              <div className="icon">🏛️</div>
              <h3>Clubs are the perfect bait</h3>
              <p>Scammers impersonate club presidents and treasurers because members trust them. Generic training never covers this.</p>
            </div>
            <div className="card">
              <div className="icon">⏱️</div>
              <h3>Minutes, not hours</h3>
              <p>Each practice round takes 2–3 minutes. Run one at a meeting or let members practice on their own.</p>
            </div>
          </div>
        </section>

        <section id="how">
          <h2>How it works</h2>
          <p className="sub">The AI does the hard part: writing a convincing scam made for your club.</p>
          <div className="grid">
            <div className="card">
              <span className="step-num">1</span>
              <h3>Tell it about your club</h3>
              <p>Enter your school, your club and the kind of scam to practice: dues requests, job offers, account alerts and more.</p>
            </div>
            <div className="card">
              <span className="step-num">2</span>
              <h3>AI writes a realistic scam</h3>
              <p>PhishProof&apos;s AI creates a personalized fake email or text that looks like something your members could actually get, with red flags hidden inside.</p>
            </div>
            <div className="card">
              <span className="step-num">3</span>
              <h3>Find the red flags</h3>
              <p>Click anything suspicious. You get an instant explanation for every red flag you catch, and see exactly what you missed.</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Why it&apos;s worth paying for</h2>
          <p className="sub">Generic phishing training is boring and forgettable. Scams that look like your own club&apos;s emails stick.</p>
          <div className="grid">
            <div className="card">
              <div className="icon">🤖</div>
              <h3>Endless fresh scenarios</h3>
              <p>No two drills are the same, so members can&apos;t memorize the answers. They have to actually learn the warning signs.</p>
            </div>
            <div className="card">
              <div className="icon">🎓</div>
              <h3>Personalized to your campus</h3>
              <p>Drills mention your school and your club, just like real scams do. That is what makes the practice transfer to real life.</p>
            </div>
            <div className="card">
              <div className="icon">💸</div>
              <h3>Cheaper than one scam</h3>
              <p>One member losing their refund or dues money costs far more than a year of PhishProof for the whole club.</p>
            </div>
          </div>
        </section>

        <section id="pricing">
          <h2>Pricing</h2>
          <p className="sub">One price for your whole club.</p>
          <div className="grid">
            <div className="card">
              <h3>Free</h3>
              <div className="price">$0</div>
              <ul>
                <li>3 AI practice scams per day</li>
                <li>Instant red-flag feedback</li>
                <li>Email and text message drills</li>
              </ul>
              <Link href="/signup" className="btn ghost">Sign up free</Link>
            </div>
            <div className="card featured">
              <h3>Club Pro</h3>
              <div className="price">$29<small>/month per club</small></div>
              <ul>
                <li>Unlimited practice for up to 50 members</li>
                <li>All scam types and difficulty levels</li>
                <li>Officer dashboard: see which scams trip members up (coming soon)</li>
              </ul>
              <Link href="/signup" className="btn">Get started</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
