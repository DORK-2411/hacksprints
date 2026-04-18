/**
 * useSpeechRecognition — Web Speech API hook
 *
 * Returns:
 *   transcript    — live text from speech recognition
 *   isListening   — true while mic is active
 *   isSupported   — false on unsupported browsers (e.g. Firefox without flag)
 *   error         — human-readable error message or null
 *   start()       — begin recognition
 *   stop()        — stop recognition
 *   reset()       — clear transcript
 */

import { useState, useRef, useCallback } from 'react';

// Extend the browser's Window type to include the Speech API (not in lib.dom by default)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }
}

interface UseSpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  // Check browser support once on hook creation
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the recognition instance across renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  /** Create and configure the recognition instance */
  const getRecognition = useCallback((): SpeechRecognition | null => {
    if (!isSupported) return null;

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const rec = new Recognition();

    // Keep listening until the user explicitly stops
    rec.continuous = true;

    // Show interim (mid-sentence) results in real time
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      // Concatenate all result segments into a single string
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      // Map raw error codes to user-friendly messages
      const messages: Record<string, string> = {
        'not-allowed':    'Microphone permission denied. Allow access in browser settings.',
        'no-speech':      'No speech detected. Please speak clearly and try again.',
        'audio-capture':  'No microphone found. Please connect one and retry.',
        'network':        'Network error during recognition. Check your connection.',
        'aborted':        'Recognition was aborted.',
        'service-not-allowed': 'Speech recognition service not allowed. Use HTTPS.',
      };
      setError(messages[e.error] ?? `Speech error: ${e.error}`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    return rec;
  }, [isSupported]);

  /** Start listening */
  const start = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setError(null);
    setTranscript('');

    const rec = getRecognition();
    if (!rec) return;

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setError('Could not start recognition. Please try again.');
    }
  }, [isSupported, getRecognition]);

  /** Stop listening */
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /** Clear the transcript */
  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return { transcript, isListening, isSupported, error, start, stop, reset };
}
