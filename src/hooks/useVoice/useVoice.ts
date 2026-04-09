import type { VoiceHook } from '../../types';

export function useVoice(): VoiceHook {
  return {
    voiceState: 'idle', transcript: '', isHandsfree: false,
    ttsRate: 1, setTtsRate: () => {}, ttsPitch: 1, setTtsPitch: () => {},
    voices: [], selectedVoice: 0, setSelectedVoice: () => {},
    speak: () => {}, stopSpeaking: () => {},
    toggleListening: () => {}, toggleHandsfree: () => {},
    clearTranscript: () => {}, isSRAvailable: false,
  };
}
