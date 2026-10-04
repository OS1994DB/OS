"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-ink-700/10 bg-cream-100 p-7 shadow-soft">
        <h1 className="mb-2 font-display text-lg font-semibold text-ink-800">Forgot password</h1>
        {sent ? (
          <p className="text-sm text-ink-600">
            If an account exists for that email, a reset link has been sent. It is valid for 1 hour.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-600">Enter your staff email and we&apos;ll send you a reset link.</p>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field mb-4" />
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </>
        )}
        <Link href="/login" className="mt-4 block text-center text-sm text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </form>
    </main>
  );
}
