"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not reset password.");
      return;
    }
    setDone(true);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-ink-700/10 bg-cream-100 p-7 shadow-soft">
      <h1 className="mb-4 font-display text-lg font-semibold text-ink-800">Choose a new password</h1>
      {done ? (
        <p className="text-sm text-ink-600">Password updated. You can now sign in.</p>
      ) : (
        <>
          <input type="password" required minLength={8} placeholder="New password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="field mb-4" />
          {error && <p className="mb-4 rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
          <button type="submit" disabled={loading || !token} className="btn-primary w-full py-2.5">
            {loading ? "Saving..." : "Set password"}
          </button>
        </>
      )}
      <Link href="/login" className="mt-4 block text-center text-sm text-brand-700 hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <Suspense>
        <ResetForm />
      </Suspense>
    </main>
  );
}
