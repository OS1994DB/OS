"use client";

import { signOut } from "next-auth/react";
import { SignOutIcon } from "@/components/icons";

export function SignOutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const styles =
    variant === "dark"
      ? "w-full text-ink-600 hover:text-ink-800 hover:bg-white/5"
      : "text-ink-600 hover:text-ink-800 hover:bg-white/5";

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${styles}`}
    >
      <SignOutIcon className="h-4 w-4" />
      Sign out
    </button>
  );
}
