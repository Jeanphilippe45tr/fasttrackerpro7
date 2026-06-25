// Lightweight notification sound using the Web Audio API (no asset required).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/** Play a short pleasant two-tone "ding" notification. */
export function playNotificationSound() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const tones = [
    { freq: 880, start: 0, dur: 0.18 },
    { freq: 1320, start: 0.12, dur: 0.22 },
  ];
  for (const tone of tones) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = tone.freq;
    const t0 = now + tone.start;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.25, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + tone.dur + 0.02);
  }
}

/**
 * Tracks the count of incoming messages and plays the sound when it grows.
 * Returns the updated reference count to store.
 */
export function notifyOnNewIncoming(prev: number, current: number) {
  if (prev >= 0 && current > prev) playNotificationSound();
  return current;
}