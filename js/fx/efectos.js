'use strict';
/* efectos.js — efectos visuales con hojas de sprites pixel art (explosión, fogonazo, humo, salpicadura, espuma) */
H.fx = {
  lista: [], grupo: null, sacudida: [0, 0],
  init(escena) { this.limpiar(); this.grupo = new THREE.Group(); escena.add(this.grupo); },
  limpiar() {
    this.lista.forEach(f => { f.s.material.map.dispose(); f.s.material.dispose(); });
    this.lista.length = 0; if (this.grupo && this.grupo.parent) this.grupo.parent.remove(this.grupo); this.grupo = null; this.sacudida = [0, 0];
  },
  anim(hoja, n, pos, ex, ey, dur, o = {}) {
    if (!this.grupo || this.lista.length > 260) return null;
    const m = new THREE.SpriteMaterial({ map: H.tex.hoja(hoja, n), transparent: true, depthWrite: false, color: o.color || 0xffffff, opacity: o.op || 1, fog: o.niebla !== false });
    const s = new THREE.Sprite(m); s.position.copy(pos); s.scale.set(ex, ey, 1);
    if (o.base) s.center.set(0.5, 0);
    this.grupo.add(s);
    this.lista.push({ s, n, t: 0, dur, vy: o.vy || 0, vx: o.vx || 0, vz: o.vz || 0, crece: o.crece || 0, op: o.op || 1, desv: o.desv });
    return s;
  },
  explosion(pos, grande) {
    const p = pos.clone(); p.y = Math.max(p.y, 2) + (grande ? 5 : 2);
    if (grande) { this.anim('explosion_big_48x48_x10', 10, p, 30, 30, 0.9, { crece: 10 }); for (let i = 0; i < 6; i++) this.humo(p, 7); }
    else { this.anim('explosion_32x32_x8', 8, p, 11, 11, 0.5, { crece: 5 }); this.humo(p, 4); }
    H.audio.explosion(grande);
  },
  fogonazo(pos) { this.anim('muzzleflash_24x24_x6', 6, pos, 7, 7, 0.22); this.humo(pos, 3, 0xdddddd); },
  humo(pos, esc = 4, color = 0x9a9a9a) {
    const p = pos.clone(); p.x += H.util.rnd(-1.5, 1.5); p.z += H.util.rnd(-1.5, 1.5);
    this.anim('humo_16x16_x6', 6, p, esc, esc, H.util.rnd(1.2, 2.0), { vy: H.util.rnd(3, 6), vx: 1.5, crece: esc * 0.6, color, op: 0.85 });
  },
  salpicadura(pos) {
    const p = pos.clone(); p.y = 0;
    this.anim('salpicadura_16x32_x6', 6, p, 7, 14, 0.75, { base: true });
    H.audio.salpicadura();
  },
  espuma(pos, esc = 3) { this.anim('humo_16x16_x6', 6, pos, esc, esc * 0.5, 1.6, { color: 0xf4faff, crece: esc * 0.8, op: 0.7 }); },
  sacudir(fuerza, idx) { if (idx === undefined) { this.sacudida[0] = Math.max(this.sacudida[0], fuerza); this.sacudida[1] = Math.max(this.sacudida[1], fuerza); } else this.sacudida[idx] = Math.max(this.sacudida[idx], fuerza); },
  actualizar(dt) {
    for (let i = this.lista.length - 1; i >= 0; i--) {
      const f = this.lista[i]; f.t += dt;
      const k = f.t / f.dur;
      if (k >= 1) { this.grupo.remove(f.s); f.s.material.map.dispose(); f.s.material.dispose(); this.lista.splice(i, 1); continue; }
      f.s.material.map.offset.x = Math.min(f.n - 1, Math.floor(k * f.n)) / f.n;
      f.s.position.y += f.vy * dt; f.s.position.x += f.vx * dt; f.s.position.z += f.vz * dt;
      if (f.crece) { const c = f.crece * dt; f.s.scale.x += c; f.s.scale.y += c; }
      if (k > 0.6) f.s.material.opacity = f.op * (1 - (k - 0.6) / 0.4);
    }
    this.sacudida[0] *= Math.pow(0.02, dt); this.sacudida[1] *= Math.pow(0.02, dt);
  }
};
