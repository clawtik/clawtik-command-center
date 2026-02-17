"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  time: string;
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => setNews(data.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fallback static news if API fails
  const fallbackNews: NewsItem[] = [
    { title: "Google Chrome Ships WebMCP — Websites Become AI Agent Tools", source: "VentureBeat", url: "#", time: "Feb 12" },
    { title: "Claude Cowork Lands on Windows with Full Feature Parity", source: "VentureBeat", url: "#", time: "Feb 11" },
    { title: "OpenAI Deploys Cerebras Chips for Near-Instant Code Gen", source: "VentureBeat", url: "#", time: "Feb 12" },
    { title: "Nvidia DMS Cuts LLM Reasoning Costs by 8x", source: "VentureBeat", url: "#", time: "Feb 12" },
    { title: "Spotify's Best Devs Haven't Written Code Since December", source: "The Verge", url: "#", time: "Feb 14" },
  ];

  const items = (news.length > 0 ? news : fallbackNews).slice(0, 4);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🔥 AI News
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-[var(--border)] rounded w-full mb-2" />
              <div className="h-2 bg-[var(--border)] rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg p-3 transition-colors cursor-pointer hover:opacity-80"
              style={{ background: "var(--bg-primary)" }}
            >
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--accent)]">{item.source}</span>
                <span className="text-xs text-[var(--text-secondary)]">· {item.time}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
