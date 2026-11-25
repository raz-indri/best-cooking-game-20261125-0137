// audio.js — one job: every sound the game makes, synthesized live with
// WebAudio. No audio files, no network. All sounds are tiny oscillator/noise
// envelopes so the game stays fully offline and self-contained.

const SoundFX = (() => {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensureContext();
    if (!ac) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(dur, vol, filterFreq) {
    if (muted) return;
    const ac = ensureContext();
    if (!ac) return;
    const t0 = ac.currentTime;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = filterFreq || 1200;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filt).connect(gain).connect(ac.destination);
    src.start(t0);
  }

  return {
    unlock() { ensureContext(); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
    click() { tone(660, 0.06, 'triangle', 0.10); },
    chop() { noiseBurst(0.09, 0.20, 2400); tone(180, 0.07, 'square', 0.08, 90); },
    sizzle() { noiseBurst(0.35, 0.07, 5200); },
    ding() { tone(880, 0.18, 'sine', 0.14); tone(1318, 0.28, 'sine', 0.10); },
    serveGood() {
      tone(523, 0.12, 'triangle', 0.14);
      setTimeout(() => tone(659, 0.12, 'triangle', 0.14), 90);
      setTimeout(() => tone(784, 0.22, 'triangle', 0.16), 180);
    },
    serveBad() { tone(220, 0.25, 'sawtooth', 0.10, 110); },
    tick() { tone(980, 0.05, 'square', 0.05); },
    newOrder() { tone(740, 0.10, 'sine', 0.11); setTimeout(() => tone(988, 0.12, 'sine', 0.11), 110); },
    burn() { noiseBurst(0.3, 0.14, 700); tone(140, 0.3, 'sawtooth', 0.08, 70); },
    gameOver() {
      [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.13), i * 170));
    },
  };
})();
