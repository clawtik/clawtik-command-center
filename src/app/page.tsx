"use client";

import { useState, useEffect } from "react";
import VoiceButton from "@/components/VoiceButton";
import EmailWidget from "@/components/EmailWidget";
import CalendarWidget from "@/components/CalendarWidget";
import QuickChat from "@/components/QuickChat";
import StatusBar from "@/components/StatusBar";
import NewsWidget from "@/components/NewsWidget";
import VitalsWidget from "@/components/VitalsWidget";

export default function Home() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Morning");
    else if (hour < 17) setGreeting("Afternoon");
    else setGreeting("Evening");
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Good {greeting}, Gatik <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Clawtik Command Center — your AI homie{"'"}s HQ
          </p>
        </div>
        <StatusBar />
      </div>

      {/* Row 1: Voice (compact) */}
      <div className="mb-5">
        <VoiceButton />
      </div>

      {/* Row 2: Email + Calendar side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <EmailWidget />
        <CalendarWidget />
      </div>

      {/* Row 3: Chat + News side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <QuickChat />
        <NewsWidget />
      </div>

      {/* Row 4: System Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <VitalsWidget />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[var(--text-secondary)]">
        Clawtik Command Center v0.1 — Built with 🔥 by Clawtik & Gatik
      </div>
    </main>
  );
}
