"use client";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl2 border border-coral-700/30 bg-coral-50 p-6">
      <h1 className="font-display text-lg font-semibold text-coral-700">Something went wrong</h1>
      <p className="mt-1 text-sm text-coral-700">
        This page couldn&apos;t load. Try again, and if it keeps happening tell the administrator
        {error.digest ? ` (reference ${error.digest})` : ""}.
      </p>
      <button onClick={reset} className="btn-primary mt-4">Try again</button>
    </div>
  );
}
