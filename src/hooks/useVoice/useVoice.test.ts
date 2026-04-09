import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVoice } from './useVoice';

describe('useVoice', () => {
  it('returns all expected properties', () => {
    const { result } = renderHook(() => useVoice());
    const hook = result.current;

    expect(hook).toHaveProperty('voiceState');
    expect(hook).toHaveProperty('transcript');
    expect(hook).toHaveProperty('isHandsfree');
    expect(hook).toHaveProperty('ttsRate');
    expect(hook).toHaveProperty('setTtsRate');
    expect(hook).toHaveProperty('ttsPitch');
    expect(hook).toHaveProperty('setTtsPitch');
    expect(hook).toHaveProperty('voices');
    expect(hook).toHaveProperty('selectedVoice');
    expect(hook).toHaveProperty('setSelectedVoice');
    expect(hook).toHaveProperty('speak');
    expect(hook).toHaveProperty('stopSpeaking');
    expect(hook).toHaveProperty('toggleListening');
    expect(hook).toHaveProperty('toggleHandsfree');
    expect(hook).toHaveProperty('clearTranscript');
    expect(hook).toHaveProperty('isSRAvailable');
  });

  it('voiceState is idle', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.voiceState).toBe('idle');
  });

  it('isSRAvailable is false', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.isSRAvailable).toBe(false);
  });

  it('transcript is an empty string', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.transcript).toBe('');
  });

  it('isHandsfree is false', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.isHandsfree).toBe(false);
  });

  it('ttsRate defaults to 1', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.ttsRate).toBe(1);
  });

  it('ttsPitch defaults to 1', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.ttsPitch).toBe(1);
  });

  it('voices is an empty array', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.voices).toEqual([]);
  });

  it('selectedVoice defaults to 0', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.selectedVoice).toBe(0);
  });

  it('functions are callable without error', () => {
    const { result } = renderHook(() => useVoice());
    const hook = result.current;

    expect(() => hook.setTtsRate(1.5)).not.toThrow();
    expect(() => hook.setTtsPitch(0.8)).not.toThrow();
    expect(() => hook.setSelectedVoice(2)).not.toThrow();
    expect(() => hook.speak('hello')).not.toThrow();
    expect(() => hook.stopSpeaking()).not.toThrow();
    expect(() => hook.toggleListening()).not.toThrow();
    expect(() => hook.toggleHandsfree()).not.toThrow();
    expect(() => hook.clearTranscript()).not.toThrow();
  });
});
