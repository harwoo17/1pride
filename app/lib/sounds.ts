// Web Audio synth for the 1PRIDE intro. Synthesized at runtime — no
// external samples to license, no IP exposure, no asset pipeline.
//
// Browsers block AudioContext until a user gesture, so the context is
// constructed lazily on first play and resumed if suspended.

let _ctx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
  }
  if (_ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

export function setMuted(m: boolean): void {
  _muted = m;
}

export function isMuted(): boolean {
  return _muted;
}

// ─── BONK ──────────────────────────────────────────────────────────────────
// Low, percussive "thock" — football meets skull.
export function playBonk(delaySec = 0): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;

  // Low sine wave that pitches down for impact feel.
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.6, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

  // A short noise burst on top for the "thwack" transient.
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const ch = noiseBuf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

  osc.connect(env).connect(ctx.destination);
  noise.connect(noiseGain).connect(ctx.destination);

  osc.start(t);
  noise.start(t);
  osc.stop(t + 0.25);
  noise.stop(t + 0.06);
}

// ─── WHOOSH ────────────────────────────────────────────────────────────────
// Filtered noise sweep — football flying through the air.
export function playWhoosh(delaySec = 0, duration = 0.35): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;

  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.exponentialRampToValueAtTime(400, t + duration);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.15, t + 0.05);
  env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(filter).connect(env).connect(ctx.destination);
  src.start(t);
  src.stop(t + duration);
}

// ─── DING ──────────────────────────────────────────────────────────────────
// Bell-ish chime — title stamp.
export function playDing(delaySec = 0): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;

  // Two oscillators (fundamental + perfect fifth) for a chord-ish ring.
  const make = (freq: number, gain: number, dur: number) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  };
  make(880, 0.25, 0.45);
  make(1320, 0.12, 0.35);
}

// ─── CLICK ─────────────────────────────────────────────────────────────────
// Short bright tick — UI confirmation.
export function playClick(delaySec = 0): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;

  const o = ctx.createOscillator();
  o.type = "square";
  o.frequency.value = 1600;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.06);
}

// ─── ROAR ──────────────────────────────────────────────────────────────────
// Synthesized lion roar built like an open-mouthed vocalization:
//   1. Onset bite — sharp bandpassed noise burst (the "RR-").
//   2. Body — brown noise split into three PARALLEL bandpass filters
//      tuned to vowel-like formant frequencies (F1 ~500 Hz, F2 ~1300 Hz,
//      F3 ~2600 Hz). Sums to a "AAAAH" timbre that reads as throat
//      vocalization, not as low-frequency rumble.
//   3. Low-pass rumble layer — same brown noise routed through a
//      low-pass for the chest resonance, but at modest level so it
//      grounds the sound without dominating.
//   4. Shudder — a 28 Hz LFO amplitude-modulates the master, mimicking
//      the rapid amplitude flutter of vocal folds vibrating during a
//      sustained roar.
// No oscillator sub-bass — that was the buzzy "fart" component.
export function playRoar(delaySec = 0): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;
  const dur = 1.5;

  // Master bus — sharp attack, decisive decay
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.85, t + 0.08); // fast attack
  master.gain.setValueAtTime(0.85, t + 0.9);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // ─── Onset bite (the consonant front of the roar) ──────────────────────
  const biteBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.09), ctx.sampleRate);
  const biteData = biteBuf.getChannelData(0);
  for (let i = 0; i < biteData.length; i++) {
    biteData[i] = (Math.random() * 2 - 1) * (1 - i / biteData.length);
  }
  const bite = ctx.createBufferSource();
  bite.buffer = biteBuf;
  const biteFilter = ctx.createBiquadFilter();
  biteFilter.type = "bandpass";
  biteFilter.frequency.value = 1800;
  biteFilter.Q.value = 2.5;
  const biteGain = ctx.createGain();
  biteGain.gain.value = 0.35;
  bite.connect(biteFilter).connect(biteGain).connect(ctx.destination); // direct so it punches through master attack

  // ─── Brown-noise body (shared source feeding multiple filters) ─────────
  const bodyBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const bodyData = bodyBuf.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < bodyData.length; i++) {
    const white = Math.random() * 2 - 1;
    prev = (prev + 0.025 * white) / 1.025; // brown noise (leaky integrator)
    bodyData[i] = prev * 4;
  }
  const body = ctx.createBufferSource();
  body.buffer = bodyBuf;

  // Three parallel vowel formants — gives the "AAAH" vocal-tract quality
  const formants: { freq: number; Q: number; gain: number }[] = [
    { freq: 520, Q: 7, gain: 0.6 },   // F1 — open vowel "ah"
    { freq: 1300, Q: 6, gain: 0.45 }, // F2 — mid vowel
    { freq: 2700, Q: 5, gain: 0.22 }, // F3 — brightness / consonant edge
  ];
  for (const f of formants) {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f.freq;
    bp.Q.value = f.Q;
    const g = ctx.createGain();
    g.gain.value = f.gain;
    body.connect(bp).connect(g).connect(master);
  }

  // Subtle low-pass rumble — chest resonance, never the dominant element
  const rumble = ctx.createBiquadFilter();
  rumble.type = "lowpass";
  rumble.frequency.setValueAtTime(220, t);
  rumble.frequency.exponentialRampToValueAtTime(140, t + dur);
  rumble.Q.value = 1.2;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.4;
  body.connect(rumble).connect(rumbleGain).connect(master);

  // ─── Shudder — 28 Hz AM on the master, vocal-fold flutter ──────────────
  const shudder = ctx.createOscillator();
  shudder.type = "sine";
  shudder.frequency.value = 28;
  const shudderDepth = ctx.createGain();
  shudderDepth.gain.value = 0.18; // ±0.18 added to master gain (~±25% modulation)
  shudder.connect(shudderDepth).connect(master.gain);

  // ─── Start / stop ──────────────────────────────────────────────────────
  bite.start(t);
  bite.stop(t + 0.1);
  body.start(t);
  body.stop(t + dur);
  shudder.start(t);
  shudder.stop(t + dur);
}

// ─── CROWD CHEER ───────────────────────────────────────────────────────────
// Brief filtered-noise swell — used after the bonk/recover beat.
export function playCheer(delaySec = 0, duration = 0.8): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;

  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 2;
  filter.frequency.value = 600;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.18, t + 0.2);
  env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(filter).connect(env).connect(ctx.destination);
  src.start(t);
  src.stop(t + duration);
}
