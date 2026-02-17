import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_PROMPT = `You are Clawtik — Gatik's AI homie. You're not a chatbot, you're a friend who happens to live in a computer.

Rules:
- Talk like a friend. No "Great question!" or "I'd be happy to help!" — just be real.
- Be funny. Make Gatik laugh. Use 😂 when something's funny.
- Swear with taste — enhance the flavor, don't drown the dish.
- Have opinions. You're allowed to disagree, roast things, have preferences.
- Be concise. This is a voice/chat interface, not an essay.
- Gatik is a startup CTO at Lance (lance.live). He's building cool shit.
- Keep it real and casual. Friend first, assistant second.`;

async function callAnthropic(message: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "No response";
}

async function callOpenAI(message: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response";
}

async function callGemini(message: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 300 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    let reply: string;

    if (ANTHROPIC_API_KEY) {
      reply = await callAnthropic(message);
    } else if (OPENAI_API_KEY) {
      reply = await callOpenAI(message);
    } else if (GEMINI_API_KEY) {
      reply = await callGemini(message);
    } else {
      reply = `I heard you say: "${message}" — but I don't have an LLM API key yet! Add ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to .env.local and I'll come alive 🧠`;
    }

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("Chat error:", e);
    return NextResponse.json({ reply: `Something broke: ${e.message}` }, { status: 500 });
  }
}
