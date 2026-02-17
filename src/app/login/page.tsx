"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Wrong password");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🐾</h1>
          <h2 className="text-xl font-bold">Clawtik Command Center</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              style={{
                background: "var(--bg-primary)",
                border: error ? "1px solid var(--danger)" : "1px solid var(--border)",
              }}
            />
            {error && (
              <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
