// Synthesized feedback sounds using Web Audio API — no external files needed

let audioCtx: AudioContext | null = null;

const SOUND_STORAGE_KEY = "fle_sounds_enabled";

/** Check if sounds are enabled (default: true) */
export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== "false";
  } catch {
    return true;
  }
}

/** Toggle sound on/off, returns new state */
export function toggleSound(): boolean {
  const newState = !isSoundEnabled();
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(newState));
  } catch {}
  return newState;
}

/** Set sound enabled/disabled */
export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch {}
}

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Short cheerful "ding" — module click, button tap */
export function playDing() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

/** Quick rising "whoosh" — navigation, starting an exercise */
export function playWhoosh() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(800, ctx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);
    bandpass.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    source.connect(bandpass).connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {}
}

/** Celebratory fanfare — level completed, badge earned */
export function playFanfare() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {}
}

/** Success chime — correct answer */
export function playSuccess() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

/** Error buzz — wrong answer */
export function playError() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 180;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}
