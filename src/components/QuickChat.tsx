"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "📧 Summarize my unread emails",
  "📅 What's on my calendar today?",
  "🔥 Latest AI news",
  "💡 Give me a startup tip",
];

export default function QuickChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Yo what's good Gatik 🤙 Ask me anything or hit the mic button to talk." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "No response" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Couldn't reach the server 😵" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div
      className="rounded-2xl flex flex-col"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height: "360px" }}
    >
      <div className="p-5 pb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          💬 Quick Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed"
              style={{
                background:
                  msg.role === "user" ? "var(--accent)" : "var(--bg-primary)",
                border:
                  msg.role === "assistant" ? "1px solid var(--border)" : "none",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Suggestions */}
        {showSuggestions && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                className="text-left text-xs rounded-lg px-3 py-2.5 transition-colors hover:opacity-80"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-4 py-2.5 text-sm"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
            >
              <span className="animate-pulse">thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 pt-2">
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type something..."
            className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="text-[var(--accent)] hover:text-white transition-colors disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
