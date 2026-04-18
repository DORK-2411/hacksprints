'use client';

/**
 * ChatInput — message input bar with voice recording support
 *
 * Props:
 *   onSend      — callback with the submitted message text
 *   disabled    — disables input while AI is responding
 */

import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    transcript,
    isListening,
    isSupported,
    error: speechError,
    start: startListening,
    stop: stopListening,
    reset: resetTranscript,
  } = useSpeechRecognition();

  // When voice transcript updates, put it in the input box
  useEffect(() => {
    if (transcript) setValue(transcript);
  }, [transcript]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSend = () => {
    const msg = value.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setValue('');
    resetTranscript();
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="border-t border-white/8 bg-[#0a0a0a] px-4 py-4">
      {/* Speech error */}
      {speechError && (
        <div role="alert" className="mb-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {speechError}
        </div>
      )}

      {/* Recording indicator */}
      {isListening && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <span
            className="w-2 h-2 rounded-full bg-red-500"
            style={{ animation: 'pulse 1s infinite' }}
          />
          <span className="text-xs text-red-400 font-medium">Recording… speak now</span>
          <span className="text-xs text-white/30 ml-auto">Press mic to stop</span>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-3">
        {/* Mic button */}
        {mounted && isSupported && (
          <button
            onClick={toggleMic}
            disabled={disabled}
            aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            aria-pressed={isListening}
            title={isListening ? 'Stop recording' : 'Voice input'}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40
              ${isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                : 'bg-white/8 text-white/60 hover:text-white hover:bg-white/12 border border-white/10'
              }`}
            style={isListening ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4zm6.5 10.5a.5.5 0 011 0A7.5 7.5 0 0112 19v3h-1v-3A7.5 7.5 0 014.5 11.5a.5.5 0 011 0A6.5 6.5 0 0012 18a6.5 6.5 0 006.5-6.5z" />
            </svg>
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            isListening
              ? 'Listening…'
              : disabled
              ? 'AI is thinking…'
              : 'Ask your career question… (Enter to send, Shift+Enter for new line)'
          }
          rows={1}
          aria-label="Chat message input"
          className="flex-1 resize-none bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00d4ff]/40 focus:bg-[#111827] transition-all leading-relaxed disabled:opacity-50"
          style={{ minHeight: '44px', maxHeight: '160px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: value.trim() && !disabled
              ? 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%)'
              : 'rgba(255,255,255,0.06)',
            boxShadow: value.trim() && !disabled ? '0 0 20px rgba(0,212,255,0.3)' : 'none',
          }}
        >
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>

      <p className="text-[10px] text-white/20 mt-2 text-center">
        AI Career Advisor · Powered by Claude · Not a substitute for professional advice
      </p>
    </div>
  );
}
