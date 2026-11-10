import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";

export default async function Nav() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="logo">
          🎣 Phish<span>Proof</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/dashboard" className="link">Dashboard</Link>
              <Link href="/practice" className="btn">Practice</Link>
              <form action={logout}>
                <button className="btn ghost" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/#how" className="link">How it works</Link>
              <Link href="/#pricing" className="link">Pricing</Link>
              <Link href="/login" className="btn ghost">Log in</Link>
              <Link href="/signup" className="btn">Sign up free</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="author">Created by Akshat Annappindi</div>
      <div>PhishProof © 2026 · Practice scams are fake and for training only.</div>
    </footer>
  );
}
