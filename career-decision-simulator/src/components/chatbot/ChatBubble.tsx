'use client';

/**
 * ChatBubble — renders a single chat message
 *
 * Props:
 *   role      — 'user' or 'assistant'
 *   content   — message text
 *   timestamp — ISO string or Date
 */

import { useState, useEffect, useRef } from 'react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Format timestamp as HH:MM
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Text-to-speech helper using Web Speech Synthesis API
function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // stop any previous speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Trigger fade-in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const isUser = role === 'user';

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    // Remove markdown-style bold markers before speaking
    const cleanText = content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    speak(cleanText);
    setSpeaking(true);

    // Detect when speech ends
    const interval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false);
        clearInterval(interval);
      }
    }, 250);
  };

  return (
    <div
      ref={bubbleRef}
      role="listitem"
      aria-label={`${role === 'user' ? 'You' : 'AI advisor'}: ${content}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      className={`flex items-end gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isUser
            ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black'
            : 'bg-[#111827] border border-[#00d4ff]/20 text-[#00d4ff]'
          }`}
      >
        {isUser ? 'U' : '✦'}
      </div>

      {/* Bubble */}
      <div className={`group max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isUser
              ? 'bg-[#00d4ff] text-black font-medium rounded-br-sm'
              : 'bg-[#111827] border border-white/8 text-white/90 rounded-bl-sm'
            }`}
        >
          {/* Render basic bold markdown */}
          {renderMarkdown(content)}
        </div>

        {/* Timestamp + TTS button (AI only) */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-white/25">
            {formatTime(timestamp)}
          </span>

          {/* Text-to-speech for AI messages */}
          {!isUser && (
            <button
              onClick={handleSpeak}
              title={speaking ? 'Stop speaking' : 'Read aloud'}
              aria-label={speaking ? 'Stop reading aloud' : 'Read this message aloud'}
              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg
                ${speaking
                  ? 'text-[#00d4ff] bg-[#00d4ff]/10'
                  : 'text-white/40 hover:text-white/70'
                }`}
            >
              {speaking ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M12 6v12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Lightweight inline markdown renderer (bold only)
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#00d4ff]">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
