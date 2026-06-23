'use client';

import { useCallback, useRef } from 'react';

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [getContext]);

  const playPop = useCallback(() => {
    playTone(600, 'sine', 0.1, 0.1);
    setTimeout(() => playTone(800, 'sine', 0.1, 0.05), 50);
  }, [playTone]);

  const playStart = useCallback(() => {
    playTone(440, 'sine', 0.8, 0.1);
    playTone(554.37, 'sine', 0.8, 0.08);
    playTone(659.25, 'sine', 0.8, 0.08);
  }, [playTone]);

  const playComplete = useCallback(() => {
    playTone(523.25, 'sine', 0.3, 0.1);
    setTimeout(() => { playTone(659.25, 'sine', 0.3, 0.1); }, 150);
    setTimeout(() => {
      playTone(783.99, 'sine', 1.5, 0.1);
      playTone(1046.50, 'sine', 1.5, 0.05);
    }, 300);
  }, [playTone]);

  const playBreathIn = useCallback((durationMs: number = 4000) => {
    const ctx = getContext();
    if (!ctx) return;
    const dur = durationMs / 1000;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + dur);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + dur / 2);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start();
  }, [getContext]);

  const playBreathOut = useCallback((durationMs: number = 4000) => {
    const ctx = getContext();
    if (!ctx) return;
    const dur = durationMs / 1000;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + dur);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + dur / 3);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start();
  }, [getContext]);

  const playHold = useCallback((durationMs: number = 4000) => {
    const ctx = getContext();
    if (!ctx) return;
    const dur = durationMs / 1000;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }, [getContext]);

  return { playPop, playStart, playComplete, playBreathIn, playBreathOut, playHold };
}
