import { NextResponse } from "next/server";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

async function getDiskUsage(): Promise<{ used: number; total: number; percent: number }> {
  try {
    const { stdout } = await execAsync("df -k / | tail -1");
    const parts = stdout.trim().split(/\s+/);
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    const percent = Math.round((used / total) * 100);
    return { used, total, percent };
  } catch {
    return { used: 0, total: 1, percent: 0 };
  }
}

async function getProcessCount(): Promise<number> {
  try {
    const { stdout } = await execAsync("ps aux | wc -l");
    return Math.max(0, parseInt(stdout.trim()) - 1);
  } catch {
    return 0;
  }
}

async function getLocalIP(): Promise<string> {
  try {
    const { stdout } = await execAsync("ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo '127.0.0.1'");
    return stdout.trim() || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = Math.round((usedMem / totalMem) * 100);

  const loadAvg = os.loadavg();
  const cpuCount = os.cpus().length;
  const cpuPercent = Math.min(100, Math.round((loadAvg[0] / cpuCount) * 100));

  const [disk, processCount, localIP] = await Promise.all([
    getDiskUsage(),
    getProcessCount(),
    getLocalIP(),
  ]);

  return NextResponse.json({
    ram: {
      used: usedMem,
      total: totalMem,
      percent: memPercent,
      usedGB: (usedMem / 1073741824).toFixed(1),
      totalGB: (totalMem / 1073741824).toFixed(1),
    },
    cpu: {
      percent: cpuPercent,
      cores: cpuCount,
      loadAvg: loadAvg.map((v) => v.toFixed(2)),
    },
    disk: {
      used: disk.used,
      total: disk.total,
      percent: disk.percent,
      usedGB: (disk.used / 1073741824).toFixed(1),
      totalGB: (disk.total / 1073741824).toFixed(1),
    },
    uptime: formatUptime(os.uptime()),
    hostname: os.hostname(),
    ip: localIP,
    processes: processCount,
    platform: os.platform(),
    arch: os.arch(),
  });
}
