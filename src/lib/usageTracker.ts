// In-memory usage accumulator — persists for the lifetime of the Node.js process.
// A Map keyed by ISO date string ("YYYY-MM-DD") → daily totals.

export interface DayUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  calls: number;
}

// Global accumulator — shared across all requests in the same process.
const usageMap: Map<string, DayUsage> = new Map();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function recordUsage(inputTokens: number, outputTokens: number): void {
  const date = today();
  const existing = usageMap.get(date) ?? { date, inputTokens: 0, outputTokens: 0, calls: 0 };
  usageMap.set(date, {
    date,
    inputTokens: existing.inputTokens + inputTokens,
    outputTokens: existing.outputTokens + outputTokens,
    calls: existing.calls + 1,
  });
}

export function getLast7Days(): DayUsage[] {
  const days: DayUsage[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push(usageMap.get(dateStr) ?? { date: dateStr, inputTokens: 0, outputTokens: 0, calls: 0 });
  }
  return days;
}

export function getTodayUsage(): DayUsage {
  const date = today();
  return usageMap.get(date) ?? { date, inputTokens: 0, outputTokens: 0, calls: 0 };
}

// Pricing: claude-sonnet-4-6 — $3/MTok input, $15/MTok output (claude-opus-4-6 is $5/$25 MTok)
export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
}
