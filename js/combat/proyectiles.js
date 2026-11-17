'use strict';
/* proyectiles.js — artillería balística (parábola con gravedad) */
H.balas = {
  lista: [], grupo: null,
  init(escena) { this.lista.length = 0; this.grupo = new THREE.Group(); escena.add(this.grupo); },
  crear(origen, objetivo, autor, dano) {
    const dx = objetivo.x - origen.x, dz = objetivo.z - origen.z, d = Math.hypot(dx, dz);
    const T = Math.max(0.45, d / H.VEL_BALA);
    const v = new THREE.Vector3(dx / T, (0 - origen.y + 0.5 * H.G * T * T) / T, dz / T);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: H.tex.hoja('projectile_16x16_x4', 4), transparent: true, depthWrite: false }));
    s.scale.set(3.2, 3.2, 1); s.position.copy(origen); this.grupo.add(s);
    this.lista.push({ s, v, autor, dano, t: 0, vida: T + 1.5 });
    if (autor.jugador !== null) H.stats.disparos++;
  },
  quitar(i) { const b = this.lista[i]; this.grupo.remove(b.s); b.s.material.map.dispose(); b.s.material.dispose(); this.lista.splice(i, 1); },
  actualizar(dt, buques) {
    for (let i = this.lista.length - 1; i >= 0; i--) {
      const b = this.lista[i], p = b.s.position;
      b.v.y -= H.G * dt; p.addScaledVector(b.v, dt); b.t += dt;
      b.s.material.map.offset.x = (Math.floor(b.t * 14) % 4) / 4;
      let fin = false;
      if (p.y < 9) for (const o of buques) {
        if (o.vivo && o.bando !== b.autor.bando && o.contiene(p, 1.3)) {
          o.recibirDano(b.dano, p.clone(), b.autor);
          if (b.autor.jugador !== null) { H.stats.impactos++; H.juego.sumar(40, b.autor.jugador, true); }
          fin = true; break;
        }
      }
      if (!fin && p.y < 0) { H.fx.salpicadura(p); fin = true; }
      if (fin || b.t > b.vida) this.quitar(i);
    }
  }
};
