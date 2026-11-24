'use strict';
/* red.js — Multijugador en línea (2 jugadores desde lugares distintos) con WebRTC + PeerJS.
   Modelo «anfitrión autoritativo»:
   - El ANFITRIÓN (J1, Huáscar) ejecuta toda la simulación con el mismo código del juego local.
   - El INVITADO (J2) solo envía sus controles (~30 veces/s) y dibuja el estado que recibe (~20 veces/s).
   - Los efectos (explosiones, disparos, mensajes, sonidos) viajan como eventos para verse y oírse en ambos lados.
   PeerJS solo se usa para presentar a los dos navegadores; luego los datos viajan directo entre ellos. */
H.red = {
  PREFIJO: 'huascar3d-utp-', peer: null, conn: null, rol: null, codigo: '', conectado: false,
  ent: { w: 0, s: 0, a: 0, d: 0, f: 0, q: 0, e: 0, x: 0 }, usado: { f: 0, q: 0, e: 0, x: 0 },
  cont: { f: 0, q: 0, e: 0, x: 0 }, tEnvio: 0, tEntrada: 0, ev: [], ultimo: null, tUltimo: 0, balas: [], orig: {},
  modoSala: '2P', nivelSala: 0, ping: 0, _tPing: 0,

  /* Opciones del servidor de señalización: el público de PeerJS o uno propio (?peerhost=...&peerport=...) */
  opcionesPeer() {
    const q = new URLSearchParams(location.search), o = { debug: 1 };
    if (q.get('peerhost')) Object.assign(o, { host: q.get('peerhost'), port: parseInt(q.get('peerport') || '9000', 10), path: q.get('peerpath') || '/', secure: location.protocol === 'https:' });
    return o;
  },
  disponible() { return typeof Peer !== 'undefined'; },
  generarCodigo() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 5; i++) c += A[Math.floor(Math.random() * A.length)]; return c; },
  estado(txt, tipo) { const e = H.util.$('salaEstado'); if (e) { e.textContent = txt; e.className = 'salaEstado ' + (tipo || ''); } },

  /* ---------- Crear sala (anfitrión) ---------- */
  crearSala() {
    this.cerrar(); this.rol = 'host'; this.codigo = this.generarCodigo();
    this.estado('Creando sala…');
    const p = this.peer = new Peer(this.PREFIJO + this.codigo, this.opcionesPeer());
    p.on('open', () => { this.estado('Sala lista. Esperando al jugador 2…', 'espera'); H.pantallas.pintarSala(); });
    p.on('connection', c => {
      if (this.conn && this.conn.open) { c.on('open', () => { c.send({ t: 'llena' }); setTimeout(() => c.close(), 300); }); return; }
      this.prepararConexion(c);
    });
    p.on('error', e => {
      if (e.type === 'unavailable-id') return this.crearSala();          // código repetido: generar otro
      this.estado('Error de conexión: ' + (e.type || e.message) + '. Revisa tu internet e intenta de nuevo.', 'error');
    });
    p.on('disconnected', () => { if (!this.conectado) this.estado('Se perdió el servidor de enlace. Reintentando…', 'error'); try { p.reconnect(); } catch (x) { /* nada */ } });
  },
  /* ---------- Unirse a una sala (invitado) ---------- */
  unirse(codigo) {
    codigo = (codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (codigo.length !== 5) { this.estado('El código de sala tiene 5 caracteres.', 'error'); return; }
    this.cerrar(); this.rol = 'guest'; this.codigo = codigo;
    this.estado('Buscando la sala ' + codigo + '…');
    const p = this.peer = new Peer(undefined, this.opcionesPeer());
    p.on('open', () => {
      const c = p.connect(this.PREFIJO + codigo, { reliable: true, serialization: 'json', metadata: { nombre: H.perfil.nombre || 'Jugador 2' } });
      this.prepararConexion(c);
      setTimeout(() => { if (!this.conectado && this.rol === 'guest') this.estado('No se pudo conectar. Verifica el código o prueba con otra red (por ejemplo, el hotspot del celular).', 'error'); }, 12000);
    });
    p.on('error', e => {
      this.estado(e.type === 'peer-unavailable' ? 'No existe la sala ' + codigo + '. Verifica el código.' : 'Error de conexión: ' + (e.type || e.message), 'error');
    });
  },
  prepararConexion(c) {
    this.conn = c;
    c.on('open', () => {
      this.conectado = true; this.tRecibido = performance.now(); H.audio.campana();
      this.enviar({ t: 'hola', nombre: H.perfil.nombre || (this.rol === 'host' ? 'Jugador 1' : 'Jugador 2'), version: H.VERSION });
      this.estado(this.rol === 'host' ? '¡Jugador 2 conectado! Elige el modo y pulsa INICIAR.' : '¡Conectado! Esperando a que el anfitrión inicie la partida…', 'ok');
      H.pantallas.pintarSala();
    });
    c.on('data', m => this.recibir(m));
    c.on('close', () => this.perdida());
    c.on('error', () => this.perdida());
  },
  /* Latido: si en 6 s no llega nada del otro jugador, se considera desconectado */
  sinSenal() { return this.tRecibido && performance.now() - this.tRecibido > 6000; },
  enviar(m) { if (this.conn && this.conn.open) try { this.conn.send(m); } catch (e) { /* canal cerrado */ } },
  perdida() {
    if (!this.rol) return;
    const enJuego = H.estado === 'JUGANDO' || H.estado === 'PAUSA' || H.estado === 'RESULTADO' || H.estado === 'BRIEFING';
    this.conectado = false;
    if (enJuego) { H.pantallas.irMenu(); H.pantallas.aviso('Se perdió la conexión con el otro jugador.'); this.cerrar(); }
    else { this.estado('El otro jugador se desconectó.', 'error'); H.pantallas.pintarSala(); }
  },
  cerrar() {
    try { if (this.conn) this.conn.close(); } catch (e) { /* nada */ }
    try { if (this.peer) this.peer.destroy(); } catch (e) { /* nada */ }
    this.conn = null; this.peer = null; this.conectado = false; this.tRecibido = 0; this.rol = null; H.online = null; this.ultimo = null;
    this.limpiarBalas();
  },

  /* ---------- Mensajes ---------- */
  recibir(m) {
    if (!m || !m.t) return;
    this.tRecibido = performance.now();
    switch (m.t) {
      case 'hola': this.otroNombre = m.nombre; H.pantallas.pintarSala(); break;
      case 'llena': this.estado('La sala ya tiene 2 jugadores.', 'error'); break;
      case 'ping': this.enviar({ t: 'pong', k: m.k }); break;
      case 'pong': this.ping = Math.round(performance.now() - m.k); break;
      // invitado → anfitrión
      case 'i': Object.assign(this.ent, m.v); break;
      case 'pedirPausa': if (H.estado === 'JUGANDO') H.pantallas.pausa(true); break;
      case 'pedirSeguir': if (H.estado === 'PAUSA') H.pantallas.pausa(false); break;
      // anfitrión → invitado
      case 'briefing': H.online = 'guest'; H.modo = m.modo; H.nivelIdx = m.nivel; H.puntaje = m.pts || 0; H.pantallas.briefing(); break;
      case 'zarpar': this.ultimo = null; this.limpiarBalas(); H.pantallas.zarparInvitado(); break;
      case 'ronda': if (H.online === 'guest') { this.ultimo = null; this.limpiarBalas(); H.juego.nuevaRonda(); } break;
      case 's': this.ultimo = m; this.tUltimo = performance.now(); H.puntaje = m.pts; this.aplicarEventos(m.ev); this.sincronizarBalas(m.p); break;
      case 'pausa': H.pantallas.pausa(m.si, true); break;
      case 'fin': Object.assign(H.stats, m.stats); H.puntaje = m.pts; H.pantallas.resultado(m.res, true); break;
      case 'menu': if (H.online === 'guest') { H.pantallas.irSala(); this.estado('El anfitrión volvió a la sala. Esperando la siguiente partida…', 'ok'); } break;
    }
  },

  /* ---------- Anfitrión: eventos y estado ---------- */
  envolver() {   // copia en la cola de eventos lo que ocurre en la partida del anfitrión
    const R = this, v = p => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10, Math.round(p.z * 10) / 10];
    const env = (obj, nombre, tipo, ser) => {
      const o = obj[nombre].bind(obj); R.orig[tipo] = o;
      obj[nombre] = function (...a) { if (H.online === 'host' && H.juego.nivel && !H.juego.diorama) R.ev.push([tipo, ...ser(a)]); return o(...a); };
    };
    env(H.fx, 'explosion', 'x', a => [...v(a[0]), a[1] ? 1 : 0]);
    env(H.fx, 'salpicadura', 's', a => v(a[0]));
    env(H.fx, 'fogonazo', 'f', a => v(a[0]));
    env(H.fx, 'sacudir', 'k', a => [a[0], a[1] === undefined ? -1 : a[1]]);
    env(H.hud, 'mensaje', 'm', a => [a[0], a[1] || 3.5]);
    env(H.hud, 'flotante', 't', a => [a[0], a[1] || 0]);
    env(H.audio, 'canon', 'c', a => [a[0] === undefined ? 1 : a[0]]);
    ['espolon', 'campana', 'logro', 'derrota'].forEach(n => env(H.audio, n, n, () => []));
  },
  tickAnfitrion(J, dt) {
    if (this.sinSenal()) return this.perdida();
    this.tEnvio -= dt; this._tPing -= dt;
    if (this._tPing <= 0) { this._tPing = 2; this.enviar({ t: 'ping', k: performance.now() }); }
    if (this.tEnvio > 0) return; this.tEnvio = 0.05;                     // 20 veces por segundo
    const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
    const b = J.buques.filter(x => !x.eliminado).map(x => [x.id, x.clave, r1(x.pos.x), r1(x.pos.z), r2(x.rumbo), r1(x.vel), Math.round(x.hp), x.maxHp, r2(x.torreAng),
      r2(x.hundiendo), (x.encallado ? 1 : 0) | (x.escapado ? 2 : 0), r1(x.emb), r2(x.espBar), r1(x.rec), r1(x.recB.izq), r1(x.recB.der), x.timon, x.jugador === null ? -1 : x.jugador]);
    const p = H.balas.lista.map(k => [r1(k.s.position.x), r1(k.s.position.y), r1(k.s.position.z), r1(k.v.x), r1(k.v.y), r1(k.v.z)]);
    const N = J.nivel;
    this.enviar({ t: 's', tt: r1(J.t), b, p, pts: H.puntaje, obj: N.objetivoTxt(J), tie: N.tiempoTxt ? N.tiempoTxt(J) : '', ev: this.ev.splice(0) });
  },

  /* ---------- Invitado: aplicar eventos, balas y estado ---------- */
  aplicarEventos(ev) {
    if (!ev || !H.juego.escena) return; const O = this.orig, V = (a, i) => new THREE.Vector3(a[i], a[i + 1], a[i + 2]);
    for (const e of ev) {
      const k = e[0];
      if (k === 'x') O.x(V(e, 1), !!e[4]); else if (k === 's') O.s(V(e, 1)); else if (k === 'f') O.f(V(e, 1));
      else if (k === 'k') O.k(e[1], e[2] < 0 ? undefined : e[2]); else if (k === 'm') O.m(e[1], e[2]); else if (k === 't') O.t(e[1], e[2]);
      else if (k === 'c') O.c(e[1] * 0.8); else if (O[k]) O[k]();
    }
  },
  limpiarBalas() { this.balas.forEach(s => { if (s.parent) s.parent.remove(s); s.material.map.dispose(); s.material.dispose(); }); this.balas = []; },
  sincronizarBalas(lista) {
    if (!H.balas.grupo) return;
    while (this.balas.length < lista.length) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: H.tex.hoja('projectile_16x16_x4', 4), transparent: true, depthWrite: false }));
      s.scale.set(3.2, 3.2, 1); s.userData.v = new THREE.Vector3(); this.balas.push(s);
    }
    this.balas.forEach((s, i) => {
      const b = lista[i];
      if (!b) { if (s.parent) s.parent.remove(s); return; }
      if (s.parent !== H.balas.grupo) H.balas.grupo.add(s);
      s.position.set(b[0], b[1], b[2]); s.userData.v.set(b[3], b[4], b[5]);
    });
  },
  actualizarInvitado(J, dt) {
    if (this.sinSenal()) return this.perdida();
    const t = J.t, s = this.ultimo, U = H.util;
    this.enviarEntrada(dt);
    if (s) {
      const edad = (performance.now() - this.tUltimo) / 1000, vivos = new Set();
      for (const r of s.b) {
        const [id, clave, x, z, rumbo, vel, hp, maxHp, tor, hund, fl, emb, esp, rec, ri, rd, tim, jug] = r;
        vivos.add(id);
        let b = J.buques.find(q => q.id === id);
        if (!b) { b = new H.Buque(clave, { control: 'RED', x, z, rumbo, jugador: jug < 0 ? null : jug }); b.id = id; J.escena.add(b.grupo); J.buques.push(b); if (jug >= 0) J.humanos[jug] = b; }
        b.clave = clave; b.vel = vel; b.hp = hp; b.maxHp = maxHp; b.torreAng = tor; b.hundiendo = hund; b.encallado = !!(fl & 1); b.escapado = !!(fl & 2);
        b.emb = emb; b.espBar = esp; b.rec = rec; b.recB.izq = ri; b.recB.der = rd; b.timon = tim;
        const k = Math.min(edad, 0.25), tx = x + Math.sin(rumbo) * vel * k, tz = z + Math.cos(rumbo) * vel * k;
        if (b.pos.distanceTo(new THREE.Vector3(tx, 0, tz)) > 60) b.pos.set(tx, 0, tz);
        b.pos.x += (tx - b.pos.x) * Math.min(1, dt * 10); b.pos.z += (tz - b.pos.z) * Math.min(1, dt * 10);
        b.rumbo += U.angDif(rumbo, b.rumbo) * Math.min(1, dt * 10);
        if (b.escapado && b.grupo.parent) b.grupo.parent.remove(b.grupo);
      }
      J.buques.forEach(b => { if (!vivos.has(b.id) && !b.eliminado) { b.eliminado = true; if (b.grupo.parent) b.grupo.parent.remove(b.grupo); } });
      J.buques = J.buques.filter(b => !b.eliminado);
    }
    J.buques.forEach(b => { b.colocar(t, dt); b.cosmetico(dt, t); });
    // proyectiles: avanzar entre paquetes
    this.balas.forEach(sp => { if (!sp.parent) return; sp.userData.v.y -= H.G * dt; sp.position.addScaledVector(sp.userData.v, dt); if (sp.position.y < -2) sp.parent.remove(sp); });
    H.fx.actualizar(dt);
    const yo = J.humanos[1];
    if (yo) {
      H.oceano.actualizar(t, yo.pos.x, yo.pos.z); H.mundo.seguirSol(yo.pos.x, yo.pos.z);
      J.vistas.forEach((j, k) => J.camara(k, dt));
      H.audio.velMotor(yo.vivo ? yo.vel : 0); if (yo.vivo && yo.hp < yo.maxHp * 0.3) H.audio.alarma();
    }
    H.hud.actualizar(J, dt);
  },
  enviarEntrada(dt) {
    const I = H.input, c = this.cont;
    if (I.clic || I.pulsada('Space') || I.pulsada('Enter')) c.f++;
    if (I.pulsada('KeyQ')) c.q++; if (I.pulsada('KeyE')) c.e++; if (I.pulsada('KeyF')) c.x++;
    this.tEntrada -= dt; if (this.tEntrada > 0) return; this.tEntrada = 1 / 30;
    this.enviar({ t: 'i', v: { w: I.abajo('KeyW') || I.abajo('ArrowUp') ? 1 : 0, s: I.abajo('KeyS') || I.abajo('ArrowDown') ? 1 : 0,
      a: I.abajo('KeyA') || I.abajo('ArrowLeft') ? 1 : 0, d: I.abajo('KeyD') || I.abajo('ArrowRight') ? 1 : 0, f: c.f, q: c.q, e: c.e, x: c.x } });
  },
  reiniciarEntradas() { Object.assign(this.ent, { w: 0, s: 0, a: 0, d: 0, f: 0, q: 0, e: 0, x: 0 }); Object.assign(this.usado, { f: 0, q: 0, e: 0, x: 0 }); Object.assign(this.cont, { f: 0, q: 0, e: 0, x: 0 }); }
};
