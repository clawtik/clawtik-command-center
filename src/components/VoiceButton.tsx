"use client";

import { useState, useRef, useCallback } from "react";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("Press to talk");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
      setTranscript("");
      setResponse("");
    };

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);
      if (current.isFinal) {
        recognitionRef.current._lastTranscript = text;
      }
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalTranscript = recognitionRef.current?._lastTranscript || "";
      if (finalTranscript) {
        setStatus("Thinking...");
        await sendToClawik(finalTranscript);
      } else {
        setStatus("Didn't catch that");
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setStatus(`Error: ${event.error}`);
    };

    recognitionRef.current = recognition;
    recognitionRef.current._lastTranscript = "";
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const sendToClawik = async (text: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setResponse(data.reply || "No response");
      setStatus("Speaking...");

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.reply }),
      });

      if (ttsRes.ok) {
        const audioBlob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          setStatus("Press to talk");
        };
        audio.play();
      } else {
        setStatus("Press to talk");
      }
    } catch {
      setStatus("Server unreachable");
    }
  };

  const handleClick = () => {
    if (isListening) stopListening();
    else if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      setStatus("Press to talk");
    } else startListening();
  };

  return (
    <div
      className="rounded-2xl px-6 py-4 flex items-center gap-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Mic Button - compact */}
      <button
        onClick={handleClick}
        className={`relative w-16 h-16 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isListening
            ? "voice-active bg-[var(--accent)] scale-110"
            : isSpeaking
            ? "voice-active bg-[var(--success)] scale-105"
            : "bg-[var(--bg-card-hover)] hover:bg-[var(--accent)] hover:scale-105"
        }`}
        style={{
          border: `2px solid ${isListening ? "var(--accent)" : isSpeaking ? "var(--success)" : "var(--border)"}`,
        }}
      >
        {isSpeaking ? (
          <div className="flex items-center gap-0.5 h-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="wave-bar w-1 bg-white rounded-full" style={{ height: "6px" }} />
            ))}
          </div>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
          </svg>
        )}
      </button>

      {/* Info area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-base font-semibold">🎙️ Voice</h2>
          <span className="text-xs text-[var(--text-secondary)]">{status}</span>
        </div>

        {transcript && (
          <p className="text-sm truncate text-[var(--text-secondary)]">
            You: {transcript}
          </p>
        )}
        {response && (
          <p className="text-sm truncate text-[var(--accent)]">
            Clawtik: {response}
          </p>
        )}
        {!transcript && !response && (
          <p className="text-xs text-[var(--text-secondary)] opacity-60">
            Click the mic or use the chat below
          </p>
        )}
      </div>
    </div>
  );
}
