'use client';

/**
 * Chatbot page — full-screen dark futuristic AI Career Advisor
 * Route: /chatbot
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import ChatWindow, { Message } from '@/components/chatbot/ChatWindow';
import ChatInput from '@/components/chatbot/ChatInput';
import UserMenu from '@/components/ui/UserMenu';

let messageCounter = 0;
function newId() { return `msg-${++messageCounter}-${Date.now()}`; }

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    // Append user message
    const userMsg: Message = {
      id: newId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history for the API (exclude timestamps)
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Build rich context from localStorage for the advisor prompt
      let contextState = null;
      try {
        const raw = localStorage.getItem('pathfinder_onboarding');
        if (raw) {
          const onboarding = JSON.parse(raw);
          // Dynamically import analysis engine to avoid SSR issues
          const { analyse, generateDetailedRoadmap } = await import('@/lib/analysisEngine');
          const result = analyse(onboarding);
          
          const roadmapData = result.roadmapCareer
            ? (() => {
                const analysis = result.careers.find(c => c.career.id === result.roadmapCareer!.id);
                if (!analysis) return null;
                const roadmap = generateDetailedRoadmap(result.roadmapCareer, analysis, onboarding);
                return {
                  phases: roadmap.phases.map(p => ({
                    phase: p.phase,
                    duration: p.duration,
                    skills: p.skills.map(s => s.name),
                    milestone: p.milestone,
                  })),
                  switchDifficulty: roadmap.switchDifficulty,
                  whyThisCareer: roadmap.whyThisCareer,
                  weakAreas: roadmap.weakAreas,
                };
              })()
            : null;

          contextState = {
            selectedCareers: result.careers.map(c => ({
              title: c.career.title,
              skillMatch: c.skillMatchScore,
              automationRisk: c.automationRisk,
              marketDemand: c.career.demand,
              gapSkills: c.gapSkills,
            })),
            currentSkills: onboarding.profile?.currentSkills ?? [],
            workPreferences: onboarding.profile?.workPreferences ?? {},
            winner: result.winner?.title ?? null,
            roadmap: roadmapData,
          };
        }
      } catch (e) {
        console.warn('Failed to build context for AI advisor:', e);
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, state: contextState }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: newId(),
        role: 'assistant',
        content: data.content ?? 'Sorry, I could not get a response. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: newId(),
        role: 'assistant',
        content: '⚠️ Something went wrong reaching the AI. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleClear = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: '#0a0a0a' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0f0f' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          aria-label="Back to home"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(0,212,255,0.05) 100%)',
              border: '1px solid rgba(0,212,255,0.4)',
              color: '#00d4ff',
            }}
          >
            ✦
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AI Career Advisor</p>
            <p
              className="text-[10px] font-medium flex items-center gap-1 mt-0.5"
              style={{ color: '#00d4ff' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: '#00d4ff', animation: 'pulse 2s infinite' }}
              />
              Online · Powered by Claude
            </p>
          </div>
        </div>

        {/* Actions */}
        <UserMenu />
      </header>

      {/* ── Message area ────────────────────────────────────────────────────── */}
      <ChatWindow messages={messages} isTyping={isTyping} />

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
      <ChatInput onSend={handleSend} disabled={isTyping} />

      {/* Keyframe for bouncing dots — injected via style tag */}
      <style>{`
        @keyframes chatDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes chatDotBounce {
            0%, 100% { transform: none; opacity: 0.6; }
          }
        }
      `}</style>
    </div>
  );
}
