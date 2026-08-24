import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceState, VoiceRecognitionResult } from '../types';

// Extend window for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
}

declare const SpeechRecognition: { new(): SpeechRecognition };

declare class SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare class SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

const SpeechRecognitionAPI: (new () => SpeechRecognition) | null =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
    : null;

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  lang?: string;
}

/** Watchdog: auto-stop if stuck in listening for too long */
const MAX_LISTEN_MS = 15_000;

export function useVoiceRecognition({
  onResult,
  lang = 'en-IN',
}: UseVoiceRecognitionOptions): VoiceRecognitionResult {
  // State machine: idle → listening → processing → success → idle
  //                any  → error
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');  // persists for success display
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef    = useRef(onResult);
  const interimRef     = useRef('');
  const watchdogRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always keep onResultRef current
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  const isSupported = SpeechRecognitionAPI !== null;

  // Cleanup on unmount
  useEffect(() => () => {
    recognitionRef.current?.abort();
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
  }, []);

  // ── State machine transitions ─────────────────────────────────────────────
  useEffect(() => {
    if (state === 'processing') {
      // Give App time to process the action, then show success
      const t = setTimeout(() => setState('success'), 500);
      return () => clearTimeout(t);
    }
    if (state === 'success') {
      // Show success state briefly, then return to idle
      const t = setTimeout(() => setState('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // If we have an interim result, process it immediately
      if (interimRef.current.trim()) {
        const text = interimRef.current.trim();
        setTranscript(text);
        setLastTranscript(text);
        setInterimTranscript('');
        interimRef.current = '';
        setState('processing');
        onResultRef.current(text);
      } else {
        setState('idle');
      }
    } else {
      setState('idle');
    }
  }, []);

  // ── Start ─────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!isSupported) {
      setErrorMessage("Voice input isn't supported in this browser. Please use Chrome or type your command instead.");
      setState('error');
      return;
    }

    // Toggle: if already listening, stop
    if (state === 'listening') { stop(); return; }

    setTranscript('');
    setInterimTranscript('');
    interimRef.current = '';
    setErrorMessage(null);

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang            = lang;
      recognition.interimResults  = true;
      // Use continuous mode so the recognition session stays open
      // long enough for the user to finish speaking. We'll manually
      // stop the session when we receive a final result or on explicit stop.
      recognition.continuous      = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState('listening');
        // Watchdog: auto-stop after MAX_LISTEN_MS
        watchdogRef.current = setTimeout(() => {
          recognition.stop();
        }, MAX_LISTEN_MS);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final   = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          interimRef.current = interim;
        }

        if (final) {
          const trimmed = final.trim();
          setTranscript(trimmed);
          setLastTranscript(trimmed);
          setInterimTranscript('');
          interimRef.current = '';
          // Cancel watchdog: we got a result
          if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
          // Move to processing state and hand the transcript to the app
          setState('processing');
          onResultRef.current(trimmed);
          // Stop the recognition session now that we have a final result
          try { recognition.stop(); } catch (e) { /* ignore */ }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
        // Ensure the recognition session is aborted/cleaned up
        try { recognition.abort(); } catch (e) { /* ignore */ }

        const errorMap: Record<string, string> = {
          'not-allowed':      'Microphone access denied. Please allow microphone permissions in your browser settings.',
          'no-speech':        'No speech detected. Try speaking closer to the mic.',
          'audio-capture':    'No microphone found. Please connect a microphone.',
          'aborted':          '',   // silent — user aborted
          'service-not-allowed': 'Speech recognition not allowed by browser policy.',
        };
        // Special-case network errors to give a Brave-specific hint when appropriate
        let msg: string | undefined;
        if (event.error === 'network') {
          const ua = typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '';
          const looksLikeBrave = ua.includes('Brave');
          if (looksLikeBrave) {
            msg = 'Speech recognition service unavailable. Brave may block this (Shields). Disable Shields for this site or try Chrome/Edge.';
          } else {
            msg = 'Speech recognition service unavailable. Try Chrome/Edge or check your network/privacy settings.';
          }
        }
        msg = msg ?? errorMap[event.error] ?? `Recognition error: ${event.error}`;
        if (msg) {
          setErrorMessage(msg);
          setState('error');
        } else {
          setState('idle');
        }
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
        recognitionRef.current = null;
        // Don't override processing/success/error state — only reset if still listening
        setState(prev => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setErrorMessage('Could not initialize microphone. Please check browser permissions.');
      setState('error');
    }
  }, [isSupported, state, lang, stop]);

  return {
    transcript,
    interimTranscript,
    lastTranscript,
    state,
    errorMessage,
    isSupported,
    start,
    stop,
    // simulate removed in production
  };
}
