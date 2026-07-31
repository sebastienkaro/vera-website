"use client";

import { useState } from "react";

/** Shown when `?edit` is requested without a valid session. */
export function EditorLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/edit/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "That didn't work.");
      }
      // Reload so the page comes back server-rendered in editing mode.
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That didn't work.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/95 p-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-lg font-medium text-white">Edit this site</h1>
        <p className="mt-1 text-sm text-white/60">Enter the password to make changes.</p>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          autoComplete="current-password"
          aria-label="Password"
          className="mt-4 w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 outline-none focus:border-white/50"
          placeholder="Password"
        />

        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="mt-4 w-full cursor-pointer rounded bg-white px-4 py-2 font-medium text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Checking…" : "Start editing"}
        </button>
      </form>
    </div>
  );
}
