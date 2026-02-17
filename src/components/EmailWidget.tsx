"use client";

import { useState, useEffect } from "react";

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  starred?: boolean;
  important?: boolean;
}

export default function EmailWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    // Remove from UI immediately
    setEmails((prev) => prev.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
    setSelectMode(false);

    // Archive/trash via API
    try {
      await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", ids: [...selected] }),
      });
    } catch {
      // Already removed from UI, fail silently
    }
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📧 Inbox
        </h2>
        <div className="flex items-center gap-2">
          {selectMode && selected.size > 0 && (
            <button
              onClick={deleteSelected}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
              style={{ background: "var(--danger)", color: "white" }}
            >
              Delete {selected.size}
            </button>
          )}
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelected(new Set());
            }}
            className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
            style={{
              background: selectMode ? "var(--accent)" : "var(--bg-primary)",
              color: selectMode ? "white" : "var(--text-secondary)",
              border: `1px solid ${selectMode ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {selectMode ? "Cancel" : "Select"}
          </button>
          {!selectMode && emails.filter((e) => e.unread).length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {emails.filter((e) => e.unread).length} new
            </span>
          )}
        </div>
      </div>

      {/* Email List — scrollable */}
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
        <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "400px" }}>
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => selectMode && toggleSelect(email.id)}
              className={`rounded-lg p-3 transition-colors ${selectMode ? "cursor-pointer" : ""}`}
              style={{
                background: selected.has(email.id)
                  ? "rgba(99,102,241,0.15)"
                  : email.unread
                  ? "rgba(99,102,241,0.05)"
                  : "var(--bg-primary)",
                borderLeft: email.important
                  ? "3px solid var(--danger)"
                  : email.starred
                  ? "3px solid var(--warning)"
                  : email.unread
                  ? "3px solid var(--accent)"
                  : "3px solid transparent",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {selectMode && (
                  <div
                    className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: selected.has(email.id) ? "var(--accent)" : "var(--border)",
                      background: selected.has(email.id) ? "var(--accent)" : "transparent",
                    }}
                  >
                    {selected.has(email.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
                <p className="text-sm font-medium truncate flex-1">
                  {email.starred && "⭐ "}{email.important && !email.starred && "🔴 "}{email.from}
                </p>
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
