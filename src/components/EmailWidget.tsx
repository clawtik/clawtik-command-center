"use client";

import { useState, useEffect } from "react";

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export default function EmailWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/emails")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEmails(data.emails || []);
      })
      .catch(() => setError("Failed to load emails"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📧 Inbox
        </h2>
        {emails.filter((e) => e.unread).length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {emails.filter((e) => e.unread).length} new
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: "var(--bg-primary)" }}>
              <div className="animate-pulse">
                <div className="h-3 bg-[var(--bg-card-hover)] rounded w-3/4 mb-2" />
                <div className="h-2 bg-[var(--bg-card-hover)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg p-4 text-center" style={{ background: "var(--bg-primary)" }}>
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm text-[var(--text-secondary)]">Couldn&apos;t load emails</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">{error}</p>
        </div>
      ) : emails.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Inbox zero! 🎉</p>
      ) : (
        <div className="space-y-3">
          {emails.slice(0, 3).map((email) => (
            <div
              key={email.id}
              className="rounded-lg p-3 cursor-pointer transition-colors"
              style={{
                background: email.unread ? "rgba(99,102,241,0.05)" : "var(--bg-primary)",
                borderLeft: email.unread ? "3px solid var(--accent)" : "3px solid transparent",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium truncate flex-1">{email.from}</p>
                <span className="text-xs text-[var(--text-secondary)] ml-2 shrink-0">
                  {email.date}
                </span>
              </div>
              <p className="text-sm truncate">{email.subject}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                {email.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
