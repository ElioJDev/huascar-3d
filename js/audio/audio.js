'use strict';
/* audio.js — música y ambiente (archivos) + efectos sintetizados con Web Audio API */
H.audio = {
  ctx: null, master: null, ruido: null, musica: null, ambiente: null, motor: null, listo: false, ultimo: {},
  init() {
    this.musica = new Audio('assets/audio/musica.mp3'); this.musica.loop = true;
    this.ambiente = new Audio('assets/audio/environment_war.wav'); this.ambiente.loop = true;
    this.canonSrc = 'assets/audio/disparo_canon.wav';
    const desbloquear = () => { this.desbloquear(); };
    addEventListener('pointerdown', desbloquear, { once: true });
    addEventListener('keydown', desbloquear, { once: true });
  },
  desbloquear() {
    if (this.listo) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.ruido = buf;
      // Motor/vapor: ruido grave en bucle, el volumen sigue a la velocidad del buque
      const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 110;
      this.motor = this.ctx.createGain(); this.motor.gain.value = 0;
      src.connect(f); f.connect(this.motor); this.motor.connect(this.master); src.start();
    } catch (e) { this.ctx = null; }
    this.listo = true; this.aplicarVolumen();
    if (this._pendMusica) this.ponerMusica(true);
  },
  aplicarVolumen() {
    const o = H.opciones, v = o.silencio ? 0 : o.vol;
    this.musica.volume = v * o.musica * 0.6; this.ambiente.volume = v * o.sfx * 0.35;
    if (this.master) this.master.gain.value = v * o.sfx;
  },
  silenciar() { H.opciones.silencio = !H.opciones.silencio; this.aplicarVolumen(); H.guardado.opciones(); },
  ponerMusica(si) { this._pendMusica = si; if (!this.listo) return; if (si) this.musica.play().catch(() => {}); else this.musica.pause(); },
  ponerAmbiente(si) { if (!this.listo) return; if (si) this.ambiente.play().catch(() => {}); else this.ambiente.pause(); },
  velMotor(v) { if (this.motor) this.motor.gain.value = Math.min(0.5, 0.08 + Math.abs(v) * 0.014); },
  pararMotor() { if (this.motor) this.motor.gain.value = 0; },
  _limite(k, ms) { const t = performance.now(); if (t - (this.ultimo[k] || 0) < ms) return true; this.ultimo[k] = t; return false; },
  canon(vol = 1) {
    if (!this.listo || this._limite('canon', 90)) return;
    const o = H.opciones, a = new Audio(this.canonSrc);
    a.volume = Math.min(1, (o.silencio ? 0 : o.vol) * o.sfx * 0.55 * vol); a.play().catch(() => {});
  },
  _ruido(dur, tipo, f0, f1, vol) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.ruido;
    const f = c.createBiquadFilter(); f.type = tipo; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur);
  },
  _tono(tipo, f0, f1, dur, vol, retardo = 0) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + retardo;
    const o = c.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur);
  },
  explosion(grande) { if (this._limite('exp', 70)) return; this._ruido(grande ? 1.6 : 0.7, 'lowpass', grande ? 900 : 1400, 60, grande ? 1 : 0.7); this._tono('sine', 90, 30, grande ? 1.0 : 0.4, 0.8); },
  salpicadura() { if (this._limite('spl', 120)) return; this._ruido(0.45, 'highpass', 900, 2500, 0.22); },
  espolon() { this._ruido(0.9, 'bandpass', 1800, 300, 0.9); this._tono('square', 140, 50, 0.6, 0.35); this._tono('sawtooth', 620, 180, 0.5, 0.2); },
  campana() { [0, 0.55].forEach(r => { this._tono('sine', 1180, 1170, 1.4, 0.35, r); this._tono('sine', 1770, 1760, 0.9, 0.15, r); }); },
  alarma() { if (this._limite('alarma', 2500)) return; this._tono('square', 660, 660, 0.18, 0.12); this._tono('square', 520, 520, 0.18, 0.12, 0.22); },
  clic() { this._tono('square', 880, 1320, 0.07, 0.15); },
  logro() { [523, 659, 784, 1047].forEach((f, i) => this._tono('square', f, f, 0.16, 0.16, i * 0.11)); },
  derrota() { [392, 330, 262, 196].forEach((f, i) => this._tono('triangle', f, f * 0.98, 0.4, 0.25, i * 0.3)); }
};
