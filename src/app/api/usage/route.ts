import { NextResponse } from "next/server";
import { getLast7Days, getTodayUsage, estimateCost } from "@/lib/usageTracker";

export async function GET() {
  const todayUsage = getTodayUsage();
  const last7Days = getLast7Days();

  const weekInputTokens = last7Days.reduce((s, d) => s + d.inputTokens, 0);
  const weekOutputTokens = last7Days.reduce((s, d) => s + d.outputTokens, 0);

  return NextResponse.json({
    today: {
      ...todayUsage,
      cost: estimateCost(todayUsage.inputTokens, todayUsage.outputTokens),
    },
    week: {
      inputTokens: weekInputTokens,
      outputTokens: weekOutputTokens,
      totalTokens: weekInputTokens + weekOutputTokens,
      cost: estimateCost(weekInputTokens, weekOutputTokens),
    },
    last7Days: last7Days.map((d) => ({
      ...d,
      totalTokens: d.inputTokens + d.outputTokens,
      cost: estimateCost(d.inputTokens, d.outputTokens),
    })),
  });
}
