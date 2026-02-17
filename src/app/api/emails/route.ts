import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getAuth } from "@/lib/google-auth";

// Skip noise — newsletters, alerts, automated stuff
const SKIP_PATTERNS = [
  /noreply/i, /no-reply/i, /notifications?@/i, /alerts?@/i,
  /mailer-daemon/i, /postmaster/i, /unsubscribe/i,
  /newsletter/i, /digest@/i, /updates@/i, /marketing@/i,
  /sentry\.io/i, /github\.com.*notifications/i,
];

const IMPORTANT_PATTERNS = [
  // People / domains that matter
  /lance\.live/i, /orrick/i, /ycombinator/i, /y-combinator/i,
  /investor/i, /vc\b/i, /fundrais/i, /term.?sheet/i, /loi\b/i,
  // Direct human signals
  /reply-to/i,
];

function isLikelyNoise(from: string, subject: string): boolean {
  const combined = `${from} ${subject}`;
  return SKIP_PATTERNS.some((p) => p.test(combined));
}

function isLikelyImportant(from: string, subject: string): boolean {
  const combined = `${from} ${subject}`;
  return IMPORTANT_PATTERNS.some((p) => p.test(combined));
}

export async function GET() {
  try {
    const auth = await getAuth();
    const gmail = google.gmail({ version: "v1", auth });

    // Fetch unread + important emails from last 7 days
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      q: "in:inbox is:unread newer_than:7d",
    });

    // Also grab starred / important labeled
    const importantRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "in:inbox (is:starred OR is:important) newer_than:7d",
    });

    // Merge and dedupe
    const allIds = new Set<string>();
    const allMsgRefs: { id: string }[] = [];
    for (const msg of [...(res.data.messages || []), ...(importantRes.data.messages || [])]) {
      if (msg.id && !allIds.has(msg.id)) {
        allIds.add(msg.id);
        allMsgRefs.push({ id: msg.id });
      }
    }

    const emails = await Promise.all(
      allMsgRefs.slice(0, 15).map(async (msg) => {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        const headers = full.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name === name)?.value || "";

        const fromRaw = getHeader("From");
        const subject = getHeader("Subject") || "(no subject)";
        const fromMatch = fromRaw.match(/^(.+?)\s*</) || [null, fromRaw];
        const from = (fromMatch[1] || fromRaw).replace(/"/g, "").trim();

        const dateStr = getHeader("Date");
        let date = "";
        try {
          const d = new Date(dateStr);
          const now = new Date();
          if (d.toDateString() === now.toDateString()) {
            date = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
          } else {
            date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
        } catch {
          date = dateStr;
        }

        const rawSnippet = full.data.snippet || "";
        const snippet = rawSnippet
          .replace(/&#(\d+);/g, (_: string, dec: string) => String.fromCharCode(Number(dec)))
          .replace(/&#x([0-9a-f]+);/gi, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");

        const labels = full.data.labelIds || [];
        const unread = labels.includes("UNREAD");
        const starred = labels.includes("STARRED");
        const gmailImportant = labels.includes("IMPORTANT");
        const important = starred || gmailImportant || isLikelyImportant(fromRaw, subject);
        const noise = isLikelyNoise(fromRaw, subject);

        return {
          id: msg.id,
          from,
          subject,
          snippet,
          date,
          unread,
          starred,
          important,
          noise,
        };
      })
    );

    // Filter: important first, then unread non-noise, skip pure noise
    const sorted = emails
      .filter((e) => !e.noise || e.important)
      .sort((a, b) => {
        // Important first
        if (a.important && !b.important) return -1;
        if (!a.important && b.important) return 1;
        // Then starred
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;
        // Then unread
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        return 0;
      });

    return NextResponse.json({ emails: sorted.slice(0, 5) });
  } catch (e: any) {
    console.error("Email API error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
