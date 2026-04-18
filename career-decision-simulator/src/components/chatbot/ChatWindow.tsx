'use client';

/**
 * ChatWindow — scrollable message list with typing indicator
 *
 * Props:
 *   messages      — array of chat messages
 *   isTyping      — show bouncing dots indicator while AI responds
 */

import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
}

export default function ChatWindow({ messages, isTyping }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message or typing state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      role="list"
      aria-label="Conversation"
      aria-live="polite"
      className="flex-1 overflow-y-auto px-4 py-6 space-y-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,212,255,0.2) transparent' }}
    >
      {/* Empty state */}
      {messages.length === 0 && !isTyping && (
        <div className="h-full flex flex-col items-center justify-center text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)', border: '1px solid rgba(0,212,255,0.2)' }}
          >
            ✦
          </div>
          <h2 className="text-lg font-bold text-white mb-2">AI Career Advisor</h2>
          <p className="text-sm text-white/40 max-w-sm">
            Ask me anything — career paths, salary expectations, skill gaps, roadmaps, or interview tips.
          </p>
          {/* Suggestion chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md w-full">
            {SUGGESTION_CHIPS.map((chip) => (
              <div
                key={chip}
                className="px-3 py-2 rounded-xl text-xs text-white/50 border border-white/8 bg-white/4 text-left"
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {/* Typing indicator — 3 bouncing dots */}
      {isTyping && (
        <div
          role="status"
          aria-label="AI is typing"
          className="flex items-end gap-3 mb-4"
          style={{ opacity: 1, transition: 'opacity 0.2s' }}
        >
          {/* AI avatar */}
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: '#111827', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
          >
            ✦
          </div>
          {/* Dots */}
          <div
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#00d4ff]/60"
                style={{
                  animation: 'chatDotBounce 1.2s infinite ease-in-out',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invisible anchor for auto-scroll */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}

const SUGGESTION_CHIPS = [
  '💼 What skills do I need for Data Science?',
  '💰 What is the average salary for a UX Designer in India?',
  '🗺️ Give me a 6-month roadmap to become a Product Manager',
  '⚖️  Should I choose Software Dev or AI Engineering?',
];
