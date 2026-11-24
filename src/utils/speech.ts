// Optional Spanish read-aloud narrator built on Web Speech API with configurable DUA rate

let currentRate = 1.0;
let activePlaybackToken = 0;
let speechActivityListener: ((speaking: boolean) => void) | null = null;

export function setSpeechActivityListener(
  listener: ((speaking: boolean) => void) | null
) {
  speechActivityListener = listener;
}

function notifySpeaking(speaking: boolean) {
  speechActivityListener?.(speaking);
}

export function setSpeechRate(rate: number) {
  currentRate = rate;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  activePlaybackToken += 1;
  notifySpeaking(false);
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech cancellation issues
  }
}

export function speakText(text: string, muted = false, rateOverride?: number) {
  if (muted || !isSpeechSupported()) return;
  const clean = text.trim();
  if (!clean) return;

  activePlaybackToken += 1;
  const myToken = activePlaybackToken;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'es-ES';
    utterance.rate = rateOverride ?? currentRate;
    utterance.pitch = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang.toLowerCase() === 'es-es') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('es'));
    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.onstart = () => {
      if (myToken === activePlaybackToken) notifySpeaking(true);
    };
    utterance.onend = () => {
      if (myToken === activePlaybackToken) notifySpeaking(false);
    };
    utterance.onerror = () => {
      if (myToken === activePlaybackToken) notifySpeaking(false);
    };

    notifySpeaking(true);
    window.speechSynthesis.speak(utterance);
  } catch {
    notifySpeaking(false);
  }
}

export interface SequenceSpeakOptions {
  muted?: boolean;
  rateOverride?: number;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Speaks a single narrative segment and invokes onEnd ONLY if this playback
 * has not been superseded or cancelled via stopSpeaking().
 */
export function speakSequenceItem(
  text: string,
  options: SequenceSpeakOptions = {}
) {
  const { muted = false, rateOverride, onEnd, onError } = options;
  if (muted || !isSpeechSupported()) {
    notifySpeaking(false);
    onError?.();
    return;
  }
  const clean = text.trim();
  if (!clean) {
    notifySpeaking(false);
    onEnd?.();
    return;
  }

  activePlaybackToken += 1;
  const myToken = activePlaybackToken;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'es-ES';
    utterance.rate = rateOverride ?? currentRate;
    utterance.pitch = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang.toLowerCase() === 'es-es') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('es'));
    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.onstart = () => {
      if (myToken === activePlaybackToken) notifySpeaking(true);
    };
    utterance.onend = () => {
      if (myToken === activePlaybackToken) {
        notifySpeaking(false);
        onEnd?.();
      }
    };
    utterance.onerror = () => {
      if (myToken === activePlaybackToken) {
        notifySpeaking(false);
        onError?.();
      }
    };

    notifySpeaking(true);
    window.speechSynthesis.speak(utterance);
  } catch {
    if (myToken === activePlaybackToken) {
      notifySpeaking(false);
      onError?.();
    }
  }
}
