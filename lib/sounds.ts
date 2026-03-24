function tone(freq: number, start: number, dur: number, vol = 0.25, ctx: AudioContext) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start);
    osc.stop(start + dur);
  } catch {}
}

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch { return null; }
}

export function playTick() {
  const c = ctx(); if (!c) return;
  tone(880, c.currentTime, 0.07, 0.15, c);
}

export function playCountdownEnd() {
  const c = ctx(); if (!c) return;
  const t = c.currentTime;
  tone(523, t,        0.12, 0.3, c);
  tone(659, t + 0.13, 0.12, 0.3, c);
  tone(784, t + 0.26, 0.28, 0.35, c);
}

export function playWin() {
  const c = ctx(); if (!c) return;
  const t = c.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.1, 0.18, 0.28, c));
}

export function playLose() {
  const c = ctx(); if (!c) return;
  const t = c.currentTime;
  [400, 320, 240].forEach((f, i) => tone(f, t + i * 0.13, 0.2, 0.25, c));
}

export function playReveal() {
  const c = ctx(); if (!c) return;
  const t = c.currentTime;
  tone(300, t,        0.08, 0.2, c);
  tone(200, t + 0.09, 0.4,  0.3, c);
}
