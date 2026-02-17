"use client";

import { useState, useRef, useCallback } from "react";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("Press to talk to Clawtik");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported in this browser");
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
      setTranscript(current[0].transcript);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalTranscript =
        recognitionRef.current?._lastTranscript || "";
      if (finalTranscript) {
        setStatus("Clawtik is thinking...");
        await sendToClawik(finalTranscript);
      } else {
        setStatus("Didn't catch that. Try again!");
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setStatus(`Error: ${event.error}`);
    };

    // Track final transcript
    const origOnResult = recognition.onresult;
    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);
      if (current.isFinal) {
        recognitionRef.current._lastTranscript = text;
      }
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

      // TTS via ElevenLabs
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
          setStatus("Press to talk to Clawtik");
        };
        audio.play();
      } else {
        setStatus("Press to talk to Clawtik");
      }
    } catch {
      setStatus("Couldn't reach Clawtik. Is the server running?");
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      setStatus("Press to talk to Clawtik");
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Card */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-6 w-full"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-lg font-semibold text-[var(--text-secondary)]">
          🎙️ Voice Interface
        </h2>

        {/* The Button */}
        <button
          onClick={handleClick}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
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
            /* Waveform */
            <div className="flex items-center gap-1 h-10">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="wave-bar w-1.5 bg-white rounded-full"
                  style={{ height: "8px" }}
                />
              ))}
            </div>
          ) : (
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
              />
            </svg>
          )}
        </button>

        {/* Status */}
        <p className="text-sm text-[var(--text-secondary)]">{status}</p>

        {/* Transcript */}
        {transcript && (
          <div className="w-full rounded-lg p-3" style={{ background: "var(--bg-primary)" }}>
            <p className="text-xs text-[var(--text-secondary)] mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div
            className="w-full rounded-lg p-3"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <p className="text-xs text-[var(--accent)] mb-1">Clawtik:</p>
            <p className="text-sm">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
