import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getAuth } from "@/lib/google-auth";

export async function GET() {
  try {
    const auth = await getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });

    const events = (res.data.items || []).map((event) => ({
      id: event.id,
      title: event.summary || "(no title)",
      start: event.start?.dateTime || event.start?.date || "",
      end: event.end?.dateTime || event.end?.date || "",
      location: event.location || undefined,
    }));

    return NextResponse.json({ events });
  } catch (e: any) {
    console.error("Calendar API error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
