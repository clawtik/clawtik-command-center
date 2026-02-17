import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getAuth } from "@/lib/google-auth";

export async function GET() {
  try {
    const auth = await getAuth();
    const gmail = google.gmail({ version: "v1", auth });

    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "in:inbox",
    });

    const messages = res.data.messages || [];
    const emails = await Promise.all(
      messages.slice(0, 5).map(async (msg) => {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        const headers = full.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name === name)?.value || "";

        const fromRaw = getHeader("From");
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

        return {
          id: msg.id,
          from,
          subject: getHeader("Subject") || "(no subject)",
          snippet: full.data.snippet || "",
          date,
          unread: (full.data.labelIds || []).includes("UNREAD"),
        };
      })
    );

    return NextResponse.json({ emails });
  } catch (e: any) {
    console.error("Email API error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
