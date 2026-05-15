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
// Lion roar = pitched vocal + breath + onset bite. The pitched layer is
// what was missing — a real roar has a clear hummable fundamental
// (around 90-110 Hz) with rich harmonics, fed through a distortion
// curve for the throat-tearing growl quality.
//
// Architecture:
//   1. ADDITIVE pitched layer — five triangle oscillators at the
//      fundamental + 4 harmonics, with a slight pitch envelope
//      (rises briefly, then falls). This is what makes it read as
//      a voice instead of wind.
//   2. WaveShaper distortion (soft tanh clipping) on the pitched
//      layer — adds growl harmonics and rasps the tone the way a
//      torn-up vocal fold does.
//   3. Low-pass after distortion tames bright clipping artifacts.
//   4. Breath texture — brown noise through a bandpass at the open-
//      mouth formant frequency (1300 Hz). Modest level — it's
//      ornamentation, not the main event.
//   5. Onset bite — fast highpass noise burst at the front for the
//      consonant attack ("RR-").
//   6. Slow 7 Hz tremolo on the master, the way a real roar wavers.
export function playRoar(delaySec = 0): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;
  const dur = 1.8;

  // Master bus
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.75, t + 0.1); // sharp attack
  master.gain.setValueAtTime(0.75, t + 1.3);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // Tremolo — slow vocal warble. AM on master gain.
  const trem = ctx.createOscillator();
  trem.type = "sine";
  trem.frequency.value = 7;
  const tremDepth = ctx.createGain();
  tremDepth.gain.value = 0.15;
  trem.connect(tremDepth).connect(master.gain);

  // ─── PITCHED VOCAL LAYER (additive triangle harmonics) ─────────────────
  const FUND = 95; // fundamental Hz
  const harmonics: { mult: number; gain: number }[] = [
    { mult: 1, gain: 0.55 },
    { mult: 2, gain: 0.32 },
    { mult: 3, gain: 0.20 },
    { mult: 4, gain: 0.12 },
    { mult: 5, gain: 0.07 },
  ];

  const harmSum = ctx.createGain();
  harmSum.gain.value = 0.42;

  for (const h of harmonics) {
    const o = ctx.createOscillator();
    o.type = "triangle";
    // Pitch envelope: rise slightly then fall (gives the roar shape)
    o.frequency.setValueAtTime(FUND * h.mult * 0.92, t);
    o.frequency.linearRampToValueAtTime(FUND * h.mult * 1.06, t + 0.35);
    o.frequency.exponentialRampToValueAtTime(FUND * h.mult * 0.78, t + dur);

    const g = ctx.createGain();
    g.gain.value = h.gain;
    o.connect(g).connect(harmSum);
    o.start(t);
    o.stop(t + dur);
  }

  // WaveShaper — soft tanh clipping. Adds growl harmonics, rasps the tone.
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    const x = (i / 2048) * 2 - 1;
    curve[i] = Math.tanh(x * 2.6);
  }
  shaper.curve = curve;
  shaper.oversample = "4x";

  // Low-pass after distortion to keep the brightness lion-ish, not buzzy
  const tameLP = ctx.createBiquadFilter();
  tameLP.type = "lowpass";
  tameLP.frequency.setValueAtTime(1400, t);
  tameLP.frequency.exponentialRampToValueAtTime(900, t + dur);
  tameLP.Q.value = 1.0;

  harmSum.connect(shaper).connect(tameLP).connect(master);

  // ─── BREATH / TEXTURE ──────────────────────────────────────────────────
  const breathBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const breathData = breathBuf.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < breathData.length; i++) {
    const w = Math.random() * 2 - 1;
    prev = (prev + 0.03 * w) / 1.03;
    breathData[i] = prev * 4;
  }
  const breath = ctx.createBufferSource();
  breath.buffer = breathBuf;
  const breathBP = ctx.createBiquadFilter();
  breathBP.type = "bandpass";
  breathBP.frequency.value = 1300;
  breathBP.Q.value = 1.4;
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.28;
  breath.connect(breathBP).connect(breathGain).connect(master);

  // ─── ONSET BITE (consonant front) ─────────────────────────────────────
  const biteBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
  const biteData = biteBuf.getChannelData(0);
  for (let i = 0; i < biteData.length; i++) {
    biteData[i] = (Math.random() * 2 - 1) * (1 - i / biteData.length);
  }
  const bite = ctx.createBufferSource();
  bite.buffer = biteBuf;
  const biteHP = ctx.createBiquadFilter();
  biteHP.type = "highpass";
  biteHP.frequency.value = 700;
  const biteGain = ctx.createGain();
  biteGain.gain.value = 0.45;
  bite.connect(biteHP).connect(biteGain).connect(ctx.destination);

  // ─── Start / stop ──────────────────────────────────────────────────────
  trem.start(t);
  trem.stop(t + dur);
  breath.start(t);
  breath.stop(t + dur);
  bite.start(t);
  bite.stop(t + 0.08);
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
