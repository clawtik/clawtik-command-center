#!/usr/bin/env node
/**
 * Mac mini vitals server
 * Run with: node scripts/vitals-server.js
 * Serves GET /vitals on port 3001 with CORS enabled.
 * Expose via tunnel (ngrok/cloudflared) and set NEXT_PUBLIC_VITALS_URL on Vercel.
 */

const http = require("http");
const os = require("os");
const { exec } = require("child_process");

const PORT = process.env.PORT || 3001;

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function execCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 5000 }, (err, stdout) => {
      resolve(err ? null : stdout.trim());
    });
  });
}

async function getDiskUsage() {
  const out = await execCmd("df -k / | tail -1");
  if (!out) return { used: 0, total: 1, percent: 0 };
  const parts = out.split(/\s+/);
  const total = parseInt(parts[1]) * 1024;
  const used = parseInt(parts[2]) * 1024;
  const percent = Math.round((used / total) * 100);
  return { used, total, percent };
}

async function getProcessCount() {
  const out = await execCmd("ps aux | wc -l");
  return out ? Math.max(0, parseInt(out) - 1) : 0;
}

async function getLocalIP() {
  const out = await execCmd(
    "ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo '127.0.0.1'"
  );
  return out || "127.0.0.1";
}

async function getVitals() {
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

  return {
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
  };
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const server = http.createServer(async (req, res) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/vitals") {
    try {
      const data = await getVitals();
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  res.writeHead(404, CORS_HEADERS);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Vitals server running on http://localhost:${PORT}/vitals`);
});
