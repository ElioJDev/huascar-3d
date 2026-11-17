'use strict';
/* juego.js — ejecución de un nivel: buques, control de los jugadores, cámaras (pantalla dividida), colisiones y reglas comunes */
H.stats = { disparos: 0, impactos: 0, dano: 0, hundidos: 0, espolon: 0 };
H.juego = {
  escena: null, buques: [], humanos: [], camaras: [], marcas: [], nivel: null, t: 0, fin: null, tFin: 0, diorama: false, enRonda: false,
  _ray: new THREE.Raycaster(), _plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), apunte: new THREE.Vector3(),

  nuevaEscena(amb) {
    H.fx.limpiar(); this.buques = []; this.humanos = []; this.camaras = []; this.marcas = [];
    this.escena = new THREE.Scene(); H.mundo.crear(this.escena, amb); H.fx.init(this.escena); H.balas.init(this.escena);
    this.t = 0; this.fin = null;
  },
  agregar(clave, o) {
    const b = new H.Buque(clave, o); this.escena.add(b.grupo); this.buques.push(b);
    if (b.jugador !== null) this.humanos[b.jugador] = b;
    return b;
  },
  _camaras() {
    const n = this.humanos.length; this.camaras = []; this.marcas = [];
    this.humanos.forEach(b => {
      const c = new THREE.PerspectiveCamera(55, (innerWidth / n) / innerHeight, 1, 2800);
      const f = b.frente(); c.position.copy(b.pos).addScaledVector(f, -70).setY(34); c.lookAt(b.pos);
      this.camaras.push(c);
      const m = new THREE.Mesh(new THREE.RingGeometry(3.4, 4.4, 20), new THREE.MeshBasicMaterial({ color: 0xffce54, transparent: true, opacity: 0.85, depthTest: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2; m.visible = b.T.arma === 'torre'; m.renderOrder = 5; this.escena.add(m); this.marcas.push(m);
    });
  },
  iniciar(nivel, modo) {
    this.diorama = false; this.nivel = nivel; this.enRonda = false;
    Object.assign(H.stats, { disparos: 0, impactos: 0, dano: 0, hundidos: 0, espolon: 0 });
    this.nuevaEscena(nivel.ambiente); nivel.crear(this, modo); this._camaras(); H.hud.crear(this);
    H.audio.campana(); H.audio.ponerAmbiente(true);
  },
  nuevaRonda() { this.nuevaEscena(this.nivel.ambiente); this.nivel.crear(this, H.modo); this._camaras(); H.hud.crear(this); H.hud.mensaje('RONDA ' + this.nivel.ronda, 2.5); H.audio.campana(); },
  iniciarDiorama() {
    this.diorama = true; this.nivel = null; this.nuevaEscena('atardecer');
    this.agregar('huascar', { control: 'NADA', x: 0, z: 0, rumbo: 0.4, maq: 0.5 });
    this.agregar('union', { control: 'NADA', x: 70, z: -70, rumbo: 0.4, maq: 0.45 });
    this.camaras = [new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 2800)];
    H.audio.ponerAmbiente(false); H.audio.pararMotor();
  },
  redimensionar() { const n = this.camaras.length || 1; this.camaras.forEach(c => { c.aspect = (innerWidth / n) / innerHeight; c.updateProjectionMatrix(); }); },

  sumar(p, idx = 0, callado) { H.puntaje += p; if (!callado) H.hud.flotante('+' + p, idx); },
  enemigoCercano(b) { let m = null, dm = 1e9; for (const x of this.buques) if (x.vivo && x.bando !== b.bando) { const d = x.pos.distanceTo(b.pos); if (d < dm) { dm = d; m = x; } } return m; },

  /* ---------- Control de los jugadores ---------- */
  controlHumano(b, idx, dt) {
    const I = H.input, uno = H.modo === '1P', j2 = !uno && idx === 1;
    if (H.debug.bot) { b.ia.rango = 150; b.ia.error = 6; H.ia.actualizar(b, dt, this); return; }
    const arr = j2 ? I.abajo('ArrowUp') : I.abajo('KeyW'), aba = j2 ? I.abajo('ArrowDown') : I.abajo('KeyS');
    const izq = j2 ? I.abajo('ArrowLeft') : I.abajo('KeyA'), der = j2 ? I.abajo('ArrowRight') : I.abajo('KeyD');
    if (arr) b.maq = Math.min(1, b.maq + dt * 0.9); if (aba) b.maq = Math.max(-0.4, b.maq - dt * 0.9);
    b.timon = (izq ? 1 : 0) - (der ? 1 : 0);
    if (b.emb > 0) b.maq = 1;
    if (b.T.arma === 'torre') {
      let dist;
      if (uno) {
        this._ray.setFromCamera(I.mouse, this.camaras[0]);
        if (!this._ray.ray.intersectPlane(this._plano, this.apunte)) { const d = this._ray.ray.direction; this.apunte.set(b.pos.x + d.x * 300, 0, b.pos.z + d.z * 300); }
        b.apuntarTorre(this.apunte); dist = Math.hypot(this.apunte.x - b.pos.x, this.apunte.z - b.pos.z);
        if (I.clic) this.fuegoTorre(b, dist);
      } else {
        if (I.abajo('KeyQ')) b.torreObj += 1.4 * dt; if (I.abajo('KeyE')) b.torreObj -= 1.4 * dt;
        dist = this.autoRango(b);
        if (I.pulsada('Space')) this.fuegoTorre(b, dist);
      }
      b._dist = H.util.clamp(dist, 30, b.T.alcance);
    } else {
      const o = this.enemigoCercano(b);
      const lead = o ? o.pos.clone().addScaledVector(o.frente(), o.vel * (o.pos.distanceTo(b.pos) / H.VEL_BALA) * 0.85) : null;
      const r = lead ? b.ladoHacia(lead) : null;
      const banda = lado => b.dispararBanda(lado, r && r.lado === lado && r.enArco ? lead : null, 7);
      if (I.pulsada('Enter') || I.pulsada('NumpadEnter')) banda(r ? r.lado : 'izq');
      if (I.pulsada('Comma')) banda('izq'); if (I.pulsada('Period')) banda('der');
    }
    const esp = uno ? I.pulsada('KeyE') : j2 ? I.pulsada('ShiftRight') : I.pulsada('KeyF');
    if (esp) this.espolon(b);
  },
  fuegoTorre(b, dist) { return b.dispararTorre(dist === undefined ? (b._dist || 150) : dist); },
  espolon(b) {
    if (b.embestir()) { H.hud.flotante('¡ESPOLÓN!', b.jugador || 0); H.audio.campana(); return true; }
    return false;
  },
  autoRango(b) {
    const a = b.rumbo + b.torreAng; let mejor = 150, dm = 1e9;
    for (const x of this.buques) if (x.vivo && x.bando !== b.bando) {
      const d = x.pos.distanceTo(b.pos), dif = Math.abs(H.util.angDif(Math.atan2(x.pos.x - b.pos.x, x.pos.z - b.pos.z), a));
      if (dif < 0.24 && d < dm) { dm = d; mejor = d; }
    }
    return mejor;
  },
  /* Comandos de voz dentro del juego (jugador 1) */
  comandoVoz(txt) {
    const c = H.voz.comando(txt), b = this.humanos[0]; if (!c || !b) return null;
    if (c === 'fuego') { if (b.T.arma === 'torre') this.fuegoTorre(b); H.voz.hablar('¡Fuego!'); }
    else if (c === 'espolon') H.voz.hablar(this.espolon(b) ? '¡Al espolón!' : 'Espolón no disponible');
    else if (c === 'avante') { b.maq = 1; H.voz.hablar('Avante toda'); }
    else if (c === 'alto') { b.maq = 0; H.voz.hablar('Máquinas paradas'); }
    else if (c === 'pausa') H.pantallas.pausa(true);
    return c;
  },

  /* ---------- Colisiones entre buques y espolonazo ---------- */
  colisiones() {
    const B = this.buques;
    for (let i = 0; i < B.length; i++) for (let j = 0; j < B.length; j++) {
      if (i === j) continue; const a = B[i], b = B[j];
      if (a.eliminado || b.eliminado || a.escapado || b.escapado || a.hundiendo > 0.4 || b.hundiendo > 0.4) continue;
      if (a.vivo && a.bando !== b.bando && b.vivo && b.contiene(a.proa(), 1.5) && Math.abs(a.vel) > 3) {
        if (a.emb > 0 && a.vel > 12) {          // ¡Espolonazo!
          const p = a.proa(); b.porEspolon = b.hp <= 60; b.recibirDano(60, p, a);
          a.emb = 0; a.vel = -7; a.maq = 0; H.fx.sacudir(4); H.audio.espolon(); H.fx.salpicadura(p);
          if (a.jugador !== null) { H.stats.espolon++; this.sumar(300, a.jugador); H.hud.mensaje('¡ESPOLONAZO a ' + b.nombre + '!', 3); }
        } else { a.vel *= -0.3; }
      }
      if (i < j) {
        const d = a.pos.distanceTo(b.pos), min = (a.T.L + b.T.L) * 0.27;
        if (d < min && d > 0.01) {
          const n = a.pos.clone().sub(b.pos).setY(0).normalize(), k = (min - d) / 2;
          if (!a.encallado && !a.hundiendo) a.pos.addScaledVector(n, k); if (!b.encallado && !b.hundiendo) b.pos.addScaledVector(n, -k);
          a.vel *= 0.92; b.vel *= 0.92;
        }
      }
    }
  },
  alHundir(b, autor) {
    if (this.diorama) return;
    if (H.modo !== 'DUELO' && b.bando === 'CL') {
      H.stats.hundidos++; let p = b.T.puntos || 500; if (b.porEspolon) { p += 500; H.audio.logro(); }
      this.sumar(p, autor && autor.jugador !== null ? autor.jugador : 0); H.hud.mensaje('¡Buque hundido: ' + b.nombre + '!' + (b.porEspolon ? ' (con el espolón)' : ''), 4);
    } else if (b.jugador !== null || b.bando === 'PE') H.hud.mensaje(b.nombre + ' se hunde…', 4);
    if (this.nivel.alHundir) this.nivel.alHundir(this, b, autor);
  },
  alEncallar(b) { if (this.nivel && this.nivel.alEncallar) this.nivel.alEncallar(this, b); },
  alEscapar(b) { b.escapado = true; b.eliminado = true; if (b.grupo.parent) b.grupo.parent.remove(b.grupo); if (this.nivel && this.nivel.alEscapar) this.nivel.alEscapar(this, b); },
  terminar(res) {
    if (this.fin) return; this.fin = res; this.tFin = res.espera === undefined ? 4 : res.espera;
    if (res.victoria) H.audio.logro(); else H.audio.derrota();
    H.hud.mensaje(res.titulo, 4);
  },

  /* ---------- Bucle del nivel ---------- */
  actualizar(dt) {
    this.t += dt; const t = this.t;
    if (this.diorama) {
      this.buques.forEach(b => b.actualizar(dt, t)); H.fx.actualizar(dt);
      const h = this.buques[0], c = this.camaras[0], a = t * 0.12;
      H.oceano.actualizar(t, h.pos.x, h.pos.z); H.mundo.seguirSol(h.pos.x, h.pos.z);
      c.position.set(h.pos.x + Math.sin(a) * 95, 20 + Math.sin(t * 0.2) * 5, h.pos.z + Math.cos(a) * 95); c.lookAt(h.pos.x + 12, 9, h.pos.z - 10);
      return;
    }
    this.humanos.forEach((b, i) => { if (b.vivo) this.controlHumano(b, i, dt); else b.timon = 0; });
    this.buques.forEach(b => { if (b.control === 'IA') H.ia.actualizar(b, dt, this); });
    this.buques.forEach(b => b.actualizar(dt, t));
    this.colisiones();
    H.balas.actualizar(dt, this.buques); H.fx.actualizar(dt);
    this.buques = this.buques.filter(b => !b.eliminado);
    if (!this.fin) this.nivel.actualizar(this, dt);
    else { this.tFin -= dt; if (this.tFin <= 0 && !this.fin.mostrado) { this.fin.mostrado = true; H.pantallas.resultado(this.fin); } }
    // Centro del mar y del sol: promedio de los jugadores presentes
    let cx = 0, cz = 0, n = 0; this.humanos.forEach(b => { if (!b.escapado) { cx += b.pos.x; cz += b.pos.z; n++; } });
    if (n) { cx /= n; cz /= n; H.oceano.actualizar(t, cx, cz); H.mundo.seguirSol(cx, cz); }
    this.humanos.forEach((b, i) => this.camara(i, dt));
    const j1 = this.humanos[0]; H.audio.velMotor(j1.vivo ? j1.vel : 0);
    if (this.humanos.some(b => b.vivo && b.hp < b.maxHp * 0.3)) H.audio.alarma();
    H.hud.actualizar(this, dt);
  },
  camara(i, dt) {
    let b = this.humanos[i]; const c = this.camaras[i], uno = H.modo === '1P';
    if (b.escapado && this.humanos[1 - i]) b = this.humanos[1 - i];
    const f = b.frente(); let mira = f;
    if (uno && b.vivo && !H.debug.bot) { const ap = this.apunte.clone().sub(b.pos).setY(0); if (ap.lengthSq() > 1) mira = f.clone().lerp(ap.normalize(), 0.3).normalize(); }
    const obj = b.pos.clone().addScaledVector(mira, -66).setY(31 + (b.hundiendo ? 8 : 0));
    c.position.lerp(obj, Math.min(1, dt * 2.6));
    const s = H.fx.sacudida[i] || 0;
    c.lookAt(b.pos.x + mira.x * 34 + H.util.rnd(-s, s), 6 + H.util.rnd(-s, s), b.pos.z + mira.z * 34 + H.util.rnd(-s, s));
    const m = this.marcas[i], hb = this.humanos[i];
    if (m && hb.T.arma === 'torre') {
      m.visible = hb.vivo; const a = hb.rumbo + hb.torreAng, d = (hb._dist || 150) + hb.T.L * 0.1;
      m.position.set(hb.pos.x + Math.sin(a) * d, 1.4, hb.pos.z + Math.cos(a) * d);
      m.material.color.setHex(hb.rec <= 0 ? 0xffce54 : 0xff6644);
    }
  },
  render(r) {
    const n = this.camaras.length, w = innerWidth, h = innerHeight;
    if (!this.escena || !n) return;
    if (n === 1) { r.setScissorTest(false); r.setViewport(0, 0, w, h); r.render(this.escena, this.camaras[0]); return; }
    r.setScissorTest(true);
    this.camaras.forEach((c, i) => {
      this.marcas.forEach((m, k) => { m.visible = k === i && this.humanos[k].vivo && this.humanos[k].T.arma === 'torre'; });
      const x = Math.floor(i * w / n); r.setViewport(x, 0, Math.floor(w / n), h); r.setScissor(x, 0, Math.floor(w / n), h); r.render(this.escena, c);
    });
    r.setScissorTest(false);
  }
};
