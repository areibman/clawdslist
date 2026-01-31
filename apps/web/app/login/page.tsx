"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@clawdslist.local");
  const [password, setPassword] = useState("lobster");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-sm text-black/60">
          Use the seeded demo account, or create a new one.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-black/70">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-black/70">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
            />
          </label>

          <button
            disabled={loading}
            className="mt-2 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          {error ? <div className="text-sm text-rose-700">{error}</div> : null}
        </form>

        <div className="mt-6 text-sm text-black/60">
          No account?{" "}
          <Link href="/register" className="font-semibold text-black underline decoration-black/20 underline-offset-4">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

