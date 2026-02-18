"use client";

import { useState, useEffect } from "react";

interface DayUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  calls: number;
  cost: number;
}

interface UsageData {
  today: DayUsage & { cost: number };
  week: { inputTokens: number; outputTokens: number; totalTokens: number; cost: number };
  last7Days: DayUsage[];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCost(dollars: number): string {
  if (dollars < 0.01) return `<$0.01`;
  return `$${dollars.toFixed(3)}`;
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function UsageWidget() {
  const [data, setData] = useState<UsageData | null>(null);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) throw new Error("fetch failed");
      setData(await res.json());
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 30_000);
    return () => clearInterval(interval);
  }, []);

  const maxTokens = data
    ? Math.max(...data.last7Days.map((d) => d.totalTokens), 1)
    : 1;

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">API Usage</h2>
        </div>
        <div className="flex items-center gap-2">
          {error ? (
            <span className="text-xs text-red-400">offline</span>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] text-gray-500">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                  : "—"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Skeleton */}
      {!data && !error && (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-gray-700 rounded-xl" />
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="flex gap-1 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-700 rounded" style={{ height: `${30 + i * 6}px` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
          <span className="text-2xl mb-2">⚠️</span>
          <span className="text-xs">Could not fetch usage data</span>
        </div>
      )}

      {/* Content */}
      {data && !error && (
        <>
          {/* Today stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-700/60 rounded-xl px-3 py-2 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Today</span>
              <span className="text-lg font-bold text-purple-300 leading-none">
                {formatTokens(data.today.inputTokens + data.today.outputTokens)}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">tokens</span>
            </div>
            <div className="bg-gray-700/60 rounded-xl px-3 py-2 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Cost</span>
              <span className="text-lg font-bold text-emerald-300 leading-none">
                {formatCost(data.today.cost)}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">today</span>
            </div>
            <div className="bg-gray-700/60 rounded-xl px-3 py-2 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Calls</span>
              <span className="text-lg font-bold text-blue-300 leading-none">{data.today.calls}</span>
              <span className="text-[10px] text-gray-500 mt-0.5">msgs</span>
            </div>
          </div>

          {/* Input vs Output split */}
          {(data.today.inputTokens + data.today.outputTokens) > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Input: {formatTokens(data.today.inputTokens)}</span>
                <span>Output: {formatTokens(data.today.outputTokens)}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="h-2 bg-blue-500 transition-all duration-700"
                  style={{
                    width: `${(data.today.inputTokens / (data.today.inputTokens + data.today.outputTokens)) * 100}%`,
                  }}
                />
                <div className="h-2 flex-1 bg-purple-500" />
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
                <span className="text-blue-400">■ input</span>
                <span className="text-purple-400">■ output</span>
              </div>
            </div>
          )}

          {/* 7-day bar chart */}
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Last 7 Days</div>
            <div className="flex items-end gap-1 h-16">
              {data.last7Days.map((day) => {
                const heightPct = maxTokens > 0 ? (day.totalTokens / maxTokens) * 100 : 0;
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] rounded px-1.5 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      {shortDate(day.date)}: {formatTokens(day.totalTokens)} tok · {formatCost(day.cost)}
                    </div>
                    <div className="w-full flex flex-col justify-end" style={{ height: "52px" }}>
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          isToday ? "bg-purple-500" : "bg-gray-600 group-hover:bg-gray-500"
                        }`}
                        style={{ height: `${Math.max(heightPct, day.totalTokens > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                    <span className={`text-[8px] ${isToday ? "text-purple-300 font-bold" : "text-gray-500"}`}>
                      {shortDate(day.date).split(" ")[1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Week total */}
          <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
            <span className="text-[10px] text-gray-400">7-day total</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-300">{formatTokens(data.week.totalTokens)} tok</span>
              <span className="text-xs font-semibold text-emerald-400">{formatCost(data.week.cost)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
