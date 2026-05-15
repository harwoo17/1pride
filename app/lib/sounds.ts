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
