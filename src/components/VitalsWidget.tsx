"use client";

import { useState, useEffect } from "react";

interface VitalsData {
  ram: { used: number; total: number; percent: number; usedGB: string; totalGB: string };
  cpu: { percent: number; cores: number; loadAvg: string[] };
  disk: { used: number; total: number; percent: number; usedGB: string; totalGB: string };
  uptime: string;
  hostname: string;
  ip: string;
  processes: number;
  platform: string;
  arch: string;
}

function barColor(percent: number): string {
  if (percent < 60) return "bg-green-500";
  if (percent < 85) return "bg-yellow-400";
  return "bg-red-500";
}

function textColor(percent: number): string {
  if (percent < 60) return "text-green-400";
  if (percent < 85) return "text-yellow-300";
  return "text-red-400";
}

function ProgressBar({ percent, label, detail }: { percent: number; label: string; detail: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{detail}</span>
          <span className={`text-xs font-bold ${textColor(percent)}`}>{percent}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-in-out ${barColor(percent)}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-700 rounded-lg px-3 py-2 flex flex-col items-center min-w-[70px]">
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-semibold text-white mt-0.5 truncate max-w-[90px] text-center">{value}</span>
    </div>
  );
}

export default function VitalsWidget() {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchVitals = async () => {
    const primaryUrl = process.env.NEXT_PUBLIC_VITALS_URL
      ? `${process.env.NEXT_PUBLIC_VITALS_URL}/vitals`
      : null;

    const tryFetch = async (url: string) => {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error("fetch failed");
      return res.json();
    };

    try {
      const data = primaryUrl
        ? await tryFetch(primaryUrl).catch(() => tryFetch("/api/vitals"))
        : await tryFetch("/api/vitals");
      setVitals(data);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-xl h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🖥️</span>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">System Vitals</h2>
        </div>
        <div className="flex items-center gap-2">
          {error ? (
            <span className="text-xs text-red-400">offline</span>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-gray-500">
                {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
              </span>
            </>
          )}
        </div>
      </div>

      {!vitals && !error && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <div className="h-3 bg-gray-700 rounded w-10" />
                <div className="h-3 bg-gray-700 rounded w-16" />
              </div>
              <div className="h-2 bg-gray-700 rounded-full w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
          <span className="text-2xl mb-2">⚠️</span>
          <span className="text-xs">Could not fetch system data</span>
        </div>
      )}

      {vitals && !error && (
        <>
          <ProgressBar
            percent={vitals.ram.percent}
            label="RAM"
            detail={`${vitals.ram.usedGB} / ${vitals.ram.totalGB} GB`}
          />
          <ProgressBar
            percent={vitals.cpu.percent}
            label="CPU"
            detail={`${vitals.cpu.cores} cores · load ${vitals.cpu.loadAvg[0]}`}
          />
          <ProgressBar
            percent={vitals.disk.percent}
            label="Disk"
            detail={`${vitals.disk.usedGB} / ${vitals.disk.totalGB} GB`}
          />

          <div className="flex flex-wrap gap-2 mt-4">
            <StatChip label="Uptime" value={vitals.uptime} />
            <StatChip label="Host" value={vitals.hostname.split(".")[0]} />
            <StatChip label="IP" value={vitals.ip} />
            <StatChip label="Procs" value={String(vitals.processes)} />
            <StatChip label="Load 5m" value={vitals.cpu.loadAvg[1]} />
            <StatChip label="Arch" value={vitals.arch} />
          </div>
        </>
      )}
    </div>
  );
}
