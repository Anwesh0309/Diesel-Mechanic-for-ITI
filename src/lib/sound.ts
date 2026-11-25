/**
 * Tiny Web-Audio sound engine — no external files needed.
 * All sounds are synthesised with the Web Audio API (oscillators + filters).
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function gain(ac: AudioContext, v: number, t = 0) {
  const g = ac.createGain();
  g.gain.setValueAtTime(v, t || ac.currentTime);
  return g;
}

/** Short UI click — soft tick */
export function playClick() {
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    const g = gain(ac, 0.18);
    o.type = 'sine';
    o.frequency.setValueAtTime(800, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.07);
  } catch { /* ignore */ }
}

/** Positive confirmation — bright ding */
export function playSuccess() {
  try {
    const ac = ctx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = gain(ac, 0.22);
      o.type = 'triangle';
      o.frequency.value = freq;
      const start = ac.currentTime + i * 0.1;
      o.start(start);
      o.stop(start + 0.22);
      g.gain.setValueAtTime(0.22, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      o.connect(g).connect(ac.destination);
    });
  } catch { /* ignore */ }
}

/** Error / wrong answer — low buzz */
export function playError() {
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    const g = gain(ac, 0.2);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(180, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.25);
    g.gain.setValueAtTime(0.2, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.26);
  } catch { /* ignore */ }
}

/** Engine ignition / crank start rumble */
export function playCrank() {
  try {
    const ac = ctx();
    // noise burst via buffer
    const bufLen = ac.sampleRate * 0.6;
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5);
    const src = ac.createBufferSource();
    src.buffer = buf;
    // low-pass to make it rumbly
    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 300;
    const g = gain(ac, 0.5);
    src.connect(lpf).connect(g).connect(ac.destination);
    src.start();
    // add engine-pulse tone
    const o = ac.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = 55;
    const g2 = gain(ac, 0.08);
    g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
    o.connect(g2).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.6);
  } catch { /* ignore */ }
}

/** Ignition success — engine fires up */
export function playIgnition() {
  try {
    const ac = ctx();
    // rising engine roar
    const bufLen = ac.sampleRate * 1.0;
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      const env = Math.min(i / (ac.sampleRate * 0.1), 1) * Math.pow(1 - i / bufLen, 0.5);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(200, ac.currentTime);
    lpf.frequency.linearRampToValueAtTime(900, ac.currentTime + 0.4);
    const g = gain(ac, 0.6);
    src.connect(lpf).connect(g).connect(ac.destination);
    src.start();
  } catch { /* ignore */ }
}

/** Misfire — dud pop */
export function playMisfire() {
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    const g = gain(ac, 0.15);
    o.type = 'square'; o.frequency.value = 90;
    o.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.13);
  } catch { /* ignore */ }
}

/** Wrench / bolt — metallic tap */
export function playWrench() {
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    const g = gain(ac, 0.3);
    o.type = 'triangle';
    o.frequency.setValueAtTime(1200, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.13);
  } catch { /* ignore */ }
}

/** Turbine spin-up whoosh */
export function playWhoosh() {
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(60, ac.currentTime);
    o.frequency.linearRampToValueAtTime(800, ac.currentTime + 0.7);
    const g = gain(ac, 0);
    g.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.35);
    g.gain.linearRampToValueAtTime(0.001, ac.currentTime + 0.7);
    const lpf = ac.createBiquadFilter();
    lpf.type = 'bandpass'; lpf.frequency.value = 300; lpf.Q.value = 0.8;
    o.connect(lpf).connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.75);
  } catch { /* ignore */ }
}

/** Electrical multimeter beep */
export function playBeep() {
  try {
    const ac = ctx();
    const o = ac.createOscillator();
    const g = gain(ac, 0.18);
    o.type = 'sine'; o.frequency.value = 1000;
    g.gain.setValueAtTime(0.18, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.13);
  } catch { /* ignore */ }
}

/** Alert / hazard found — warning chime */
export function playAlert() {
  try {
    const ac = ctx();
    [880, 660].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = gain(ac, 0.2);
      o.type = 'sine'; o.frequency.value = freq;
      const t = ac.currentTime + i * 0.14;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + 0.15);
    });
  } catch { /* ignore */ }
}

/** Stage complete — fanfare */
export function playFanfare() {
  try {
    const ac = ctx();
    const melody = [523, 659, 783, 1047];
    melody.forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = gain(ac, 0.2);
      o.type = 'triangle'; o.frequency.value = freq;
      const t = ac.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + 0.19);
    });
  } catch { /* ignore */ }
}
