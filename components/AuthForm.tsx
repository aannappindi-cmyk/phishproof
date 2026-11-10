"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, signup, type FormState } from "@/app/actions";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, {});
  const isSignup = mode === "signup";
  // Controlled so a failed attempt keeps what the person typed.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="auth card">
      <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
      <p className="sub" style={{ margin: 0 }}>
        {isSignup ? "Start practicing with 3 free AI scams per day." : "Log in to keep practicing."}
      </p>
      <form action={action}>
        {isSignup && (
          <>
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </>
        )}
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 8 : undefined}
          required
        />
        {state.error && <div className="error">{state.error}</div>}
        <button className="btn big" type="submit" disabled={pending} style={{ width: "100%", marginTop: 20 }}>
          {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>
      <p className="hint">
        {isSignup ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>New to PhishProof? <Link href="/signup">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
