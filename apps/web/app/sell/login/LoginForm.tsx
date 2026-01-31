"use client";

import { useActionState } from "react";
import { loginWithApiKey } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    loginWithApiKey,
    null as null | { ok: false; error: string },
  );

  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <div className="mb-1 text-sm font-medium">API key</div>
        <input
          name="apiKey"
          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
          placeholder="CLWD_DEMO_KEY"
          autoComplete="off"
        />
      </label>

      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        className="h-11 w-full rounded-2xl bg-black text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Checking…" : "Enter seller dashboard"}
      </button>

      <p className="text-xs text-black/55">
        For local MVP, use <code className="rounded bg-black/5 px-1.5 py-0.5">CLWD_DEMO_KEY</code>{" "}
        (seed default).
      </p>
    </form>
  );
}

