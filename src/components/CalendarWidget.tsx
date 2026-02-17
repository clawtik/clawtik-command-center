"use client";

import { useState, useEffect } from "react";

interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEvents(data.events || []);
      })
      .catch(() => setError("Failed to load calendar"))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const isNow = (start: string, end: string) => {
    const now = Date.now();
    return now >= new Date(start).getTime() && now <= new Date(end).getTime();
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        📅 Today
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-[var(--border)] rounded w-2/3 mb-2" />
              <div className="h-2 bg-[var(--border)] rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No events today. Chill day 😎</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg p-3"
              style={{
                background: isNow(event.start, event.end)
                  ? "rgba(34,197,94,0.1)"
                  : "var(--bg-primary)",
                borderLeft: isNow(event.start, event.end)
                  ? "3px solid var(--success)"
                  : "3px solid var(--border)",
              }}
            >
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {formatTime(event.start)} — {formatTime(event.end)}
              </p>
              {event.location && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  📍 {event.location}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
