import type { VoiceState, CommandResult, SupportedLanguage } from '../../types';
import { LANGUAGE_META } from '../../types';

interface VoiceInputProps {
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  lastTranscript: string;
  errorMessage: string | null;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  commandResult?: CommandResult | null;
  language?: SupportedLanguage;
}

const STATE_TITLES: Record<VoiceState, string> = {
  idle:       'TAP TO SPEAK',
  listening:  'LISTENING...',
  processing: 'UNDERSTANDING YOUR REQUEST...',
  success:    'COMMAND RECEIVED',
  error:      'VOICE ERROR',
};

const STATE_SUBS: Record<VoiceState, string> = {
  idle:       'Tap mic or use bottom command bar',
  listening:  'Speak your command clearly (e.g. "Add milk")',
  processing: 'Parsing NLP intent...',
  success:    '✓ Action executed',
  error:      "I couldn't understand that. Try saying 'Add milk'.",
};

export function VoiceInput({
  voiceState,
  transcript,
  interimTranscript,
  lastTranscript,
  errorMessage,
  isSupported,
  onStart,
  onStop,
  commandResult,
  language,
}: VoiceInputProps) {

  const handleMic = () => {
    if (!isSupported) return;
    voiceState === 'listening' ? onStop() : onStart();
  };

  const isListening  = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isSuccess    = voiceState === 'success';
  const isError      = voiceState === 'error';

  // Recognized text to show
  const currentTranscript = interimTranscript || transcript;
  const recognizedText = commandResult?.transcript || lastTranscript || currentTranscript;

  return (
    <div className={`voxa-card voxa-voice-card ${isListening ? 'is-listening' : ''} ${isProcessing ? 'is-processing' : ''}`}>

      {/* ── Soundwave + Mic Stage ── */}
      <div className="voxa-voice-stage">
        {/* Left Waveform Bars */}
        <div className="voxa-waveform">
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
        </div>

        {/* Center Mic Button */}
        <div className="voxa-mic-wrapper">
          {isListening && (
            <>
              <div className="voxa-mic-ripple voxa-mic-ripple-1" />
              <div className="voxa-mic-ripple voxa-mic-ripple-2" />
            </>
          )}

          <button
            className={`voxa-mic-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
            onClick={handleMic}
            disabled={!isSupported || isProcessing}
            aria-label={isListening ? 'Stop listening' : 'Start voice recognition'}
          >
            {isProcessing ? (
              <span style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : isListening ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        </div>

        {/* Right Waveform Bars */}
        <div className="voxa-waveform">
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
          <div className="voxa-wave-bar" />
        </div>
      </div>

      {/* ── Status Text ── */}
      <div className="voxa-voice-status">
        <h3 className="voxa-voice-state-title">
          {STATE_TITLES[voiceState]}
        </h3>
        <p className="voxa-voice-state-sub">
          {isError && errorMessage ? errorMessage : STATE_SUBS[voiceState]}
        </p>
      </div>

      {/* ── Recognized Transcript Display ── */}
      {recognizedText && (
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Language: {language ? LANGUAGE_META[language].label : 'English'}
          </div>
          <div className="voxa-transcript-box">
            "{recognizedText}"
          </div>
        </div>
      )}

      {/* ── Confirmation Status Pill Row ── */}
      {(recognizedText || isProcessing || isSuccess || commandResult) && (
        <div className="voxa-confirmation-pill">
          <span className="voxa-pill-check">
            ✓ Heard clearly
          </span>
          <span className="voxa-pill-divider" />
          <span>
            {commandResult
              ? `${commandResult.success ? '✓' : '✗'} ${commandResult.message}`
              : isProcessing
              ? '⟳ Processing...'
              : '✓ Ready'}
          </span>
        </div>
      )}

      {!isSupported && (
        <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.75rem' }}>
          🎙 Web Speech API not supported in this browser. Please use Chrome or Edge.
        </p>
      )}
    </div>
  );
}
