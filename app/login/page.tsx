"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 60rem at 20% 20%, rgba(79,191,179,0.16), transparent 60%), radial-gradient(50rem 50rem at 80% 80%, rgba(240,174,85,0.10), transparent 60%)",
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-2xl border border-ink-700/10 bg-cream-100 p-7 shadow-soft"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-900 font-display text-base font-bold text-white shadow-sm">
            W
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-semibold text-ink-800">Westcliff Lodge</h1>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-600">Operating System</p>
          </div>
        </div>

        <p className="mb-5 text-sm text-ink-600">Sign in with your staff account to continue.</p>

        <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mb-4"
        />

        <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field mb-5"
        />

        {error && (
          <p className="mb-4 rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
