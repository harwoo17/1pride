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
// Real recorded lion roar (royalty-free, Pixabay).
// File at /public/sounds/lion-roar.mp3 — preload on first user gesture
// so playback is instant when the user hits Press Start.

const ROAR_URL = "/sounds/lion-roar.mp3";
let _roarBuffer: AudioBuffer | null = null;
let _roarLoadPromise: Promise<AudioBuffer | null> | null = null;

/** Fetch + decode the roar MP3. Call before you need it (e.g. on mount). */
export function preloadRoar(): Promise<AudioBuffer | null> {
  if (_roarBuffer) return Promise.resolve(_roarBuffer);
  if (_roarLoadPromise) return _roarLoadPromise;

  _roarLoadPromise = (async () => {
    const ctx = getCtx();
    if (!ctx) return null;
    try {
      const res = await fetch(ROAR_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      _roarBuffer = buf;
      return buf;
    } catch (e) {
      console.warn("[1pride] roar load failed:", e);
      return null;
    }
  })();
  return _roarLoadPromise;
}

export function playRoar(delaySec = 0, volume = 0.85): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;

  // Kick off preload if we haven't yet. If the buffer's already there
  // (preloaded), play immediately. If not, play when decode resolves
  // — there'll be a perceptible delay on the very first user gesture
  // unless preloadRoar() was called earlier.
  const start = (buf: AudioBuffer | null) => {
    if (!buf || _muted) return;
    const ctxNow = getCtx();
    if (!ctxNow) return;
    const t = ctxNow.currentTime + delaySec;

    const src = ctxNow.createBufferSource();
    src.buffer = buf;

    // Master gain — a touch of envelope so the roar doesn't click in/out
    const gain = ctxNow.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.setValueAtTime(volume, t + Math.max(0.1, buf.duration - 0.15));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + buf.duration);

    src.connect(gain).connect(ctxNow.destination);
    src.start(t);
    src.stop(t + buf.duration + 0.1);
  };

  if (_roarBuffer) {
    start(_roarBuffer);
  } else {
    preloadRoar().then(start);
  }
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
