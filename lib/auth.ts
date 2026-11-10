import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { db } from "./db";

const COOKIE = "pp_session";
const SESSION_DAYS = 30;

export type User = {
  id: number;
  email: string;
  name: string;
  plan: "free" | "pro";
  created_at: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Sessions live in the database; the browser only holds a random token.
export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const pool = await db();
  await pool.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [
    hashToken(token),
    userId,
    expires,
  ]);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const pool = await db();
  const { rows } = await pool.query<User>(
    `SELECT u.id, u.email, u.name, u.plan, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > NOW()`,
    [hashToken(token)]
  );
  return rows[0] ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const pool = await db();
    await pool.query("DELETE FROM sessions WHERE id = $1", [hashToken(token)]);
  }
  jar.delete(COOKIE);
}
