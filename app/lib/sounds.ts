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
// Three-layer synthesized lion roar:
//   1. Snarl transient — short bandpassed noise burst at the front.
//   2. Body — brown noise (more realistic than white) through a low-pass
//      filter that opens up briefly then closes back down.
//   3. Sub-bass growl — sawtooth around 70 Hz with an LFO vibrating the
//      frequency at ~6 Hz to give the throat-tremble feel.
export function playRoar(delaySec = 0): void {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const t = ctx.currentTime + delaySec;
  const dur = 1.6;

  // Master bus — shapes the overall amplitude envelope of the roar
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.7, t + 0.18);
  master.gain.setValueAtTime(0.7, t + 1.0);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // ─── Snarl transient (the bite at the start) ───────────────────────────
  const snarlBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
  const snarlData = snarlBuf.getChannelData(0);
  for (let i = 0; i < snarlData.length; i++) {
    snarlData[i] = (Math.random() * 2 - 1) * (1 - i / snarlData.length);
  }
  const snarl = ctx.createBufferSource();
  snarl.buffer = snarlBuf;
  const snarlFilter = ctx.createBiquadFilter();
  snarlFilter.type = "bandpass";
  snarlFilter.frequency.value = 1600;
  snarlFilter.Q.value = 2.5;
  const snarlGain = ctx.createGain();
  snarlGain.gain.setValueAtTime(0.35, t);
  snarlGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  snarl.connect(snarlFilter).connect(snarlGain).connect(master);

  // ─── Body — brown noise through swept low-pass ─────────────────────────
  const bodyBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const bodyData = bodyBuf.getChannelData(0);
  // Brown noise via running integration of white noise (Leaky integrator).
  let lastOut = 0;
  for (let i = 0; i < bodyData.length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    bodyData[i] = lastOut * 3.5; // amplify post-filter
  }
  const body = ctx.createBufferSource();
  body.buffer = bodyBuf;
  const bodyLP = ctx.createBiquadFilter();
  bodyLP.type = "lowpass";
  bodyLP.frequency.setValueAtTime(380, t);
  bodyLP.frequency.exponentialRampToValueAtTime(950, t + 0.35);
  bodyLP.frequency.exponentialRampToValueAtTime(550, t + 1.5);
  bodyLP.Q.value = 4;
  const bodyGain = ctx.createGain();
  bodyGain.gain.value = 0.65;
  body.connect(bodyLP).connect(bodyGain).connect(master);

  // ─── Sub-bass growl with frequency vibrato ─────────────────────────────
  const sub = ctx.createOscillator();
  sub.type = "sawtooth";
  sub.frequency.setValueAtTime(80, t);
  sub.frequency.exponentialRampToValueAtTime(60, t + 1.4);

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 5.5;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 6; // ±6 Hz vibrato
  lfo.connect(lfoDepth).connect(sub.frequency);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.0001, t);
  subGain.gain.exponentialRampToValueAtTime(0.5, t + 0.25);
  subGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  sub.connect(subGain).connect(master);

  // ─── Start / stop everything together ──────────────────────────────────
  snarl.start(t);
  snarl.stop(t + 0.13);
  body.start(t);
  body.stop(t + dur);
  sub.start(t);
  sub.stop(t + dur);
  lfo.start(t);
  lfo.stop(t + dur);
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
