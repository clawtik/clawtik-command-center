"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import VoiceButton from "@/components/VoiceButton";
import EmailWidget from "@/components/EmailWidget";
import CalendarWidget from "@/components/CalendarWidget";
import QuickChat from "@/components/QuickChat";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Morning");
    else if (hour < 17) setGreeting("Afternoon");
    else setGreeting("Evening");
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {greeting}, Gatik <span className="text-2xl">👋</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Clawtik Command Center — your AI homie&apos;s HQ
          </p>
        </div>
        <StatusBar />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column - Widgets */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <EmailWidget />
          <CalendarWidget />
        </div>

        {/* Center - Voice Interface */}
        <div className="col-span-12 lg:col-span-4 flex flex-col items-center">
          <VoiceButton />
        </div>

        {/* Right Column - Chat */}
        <div className="col-span-12 lg:col-span-4">
          <QuickChat />
        </div>
      </div>
    </main>
  );
}
