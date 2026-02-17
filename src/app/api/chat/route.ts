import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // For now, echo back with a placeholder.
    // TODO: Wire to OpenClaw API or LLM endpoint
    const reply = `I heard you say: "${message}" — Chat API integration coming soon! For now I'm just a pretty face 😂`;

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
