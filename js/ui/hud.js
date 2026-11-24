'use strict';
/* hud.js — interfaz en juego: paneles por jugador, radar con sprites pixel art, mensajes y panel QA (F2) */
H.hud = {
  pan: [], tMsg: 0, verQA: false,
  crear(J) {
    const c = H.util.$('hudJugadores'); c.innerHTML = ''; this.pan = [];
    const vistas = J.vistas.length ? J.vistas : J.humanos.map((b, i) => i), n = vistas.length;
    vistas.forEach((i, k) => {
      const b = J.humanos[i], uno = J.mandoMouse(i), red = !!H.online;
      const d = document.createElement('div'); d.className = 'hudJ' + (n > 1 && k === 1 ? ' der' : '');
      d.style.left = (k * 100 / n) + '%'; d.style.width = (100 / n) + '%';
      const torre = b.T.arma === 'torre';
      const ayuda = red && i === 1 ? 'W/S máquinas · A/D timón · Clic o Espacio fuego · Q/E babor/estribor · F espolón' : uno ? 'W/S máquinas · A/D timón · Mouse apunta · Clic dispara · E espolón · V voz · P pausa'
        : i === 0 ? 'J1: W/S · A/D · Q/E torre · Espacio fuego · F espolón' : 'J2: ↑/↓ · ←/→ · Enter fuego · , . bandas · Shift der. espolón';
      d.innerHTML = `<div class="vineta"></div>
        <div class="panel">
          <div class="nombre">${n > 1 || red ? 'J' + (i + 1) + ' · ' : ''}${b.nombre}${red ? ' · EN LÍNEA' : ''}</div>
          <div class="et"><img src="assets/pixelart/png/icono_casco.png" alt="">CASCO <span class="tHp"></span></div><div class="bar bCasco"><div></div></div>
          ${torre ? '<div class="et"><img src="assets/pixelart/png/icono_canon.png" alt="">TORRE</div><div class="bar bRec r1"><div></div></div>'
            : '<div class="et"><img src="assets/pixelart/png/icono_canon.png" alt="">BABOR / ESTRIBOR</div><div class="bar bRec r1"><div></div></div><div class="bar bRec r2" style="margin-top:2px"><div></div></div>'}
          ${b.T.espolon ? '<div class="et"><img src="assets/pixelart/png/icono_espolon.png" alt="">ESPOLÓN <span class="tEsp"></span></div><div class="bar bEsp"><div></div></div>' : ''}
          <div class="et"><img src="assets/pixelart/png/icono_ancla.png" alt="">VELOCIDAD <span class="tVel">0</span> nudos</div>
        </div>
        <div class="estado"></div>
        ${uno ? '<div class="mira"></div>' : ''}
        <canvas class="radar" width="150" height="150"></canvas>
        <div class="ayuda">${ayuda}</div>`;
      c.appendChild(d);
      const q = s => d.querySelector(s);
      this.pan.push({ j: i, d, hp: q('.bCasco>div'), tHp: q('.tHp'), r1: q('.r1>div'), r2: q('.r2>div'), esp: q('.bEsp>div'), tEsp: q('.tEsp'), vel: q('.tVel'),
        vin: q('.vineta'), est: q('.estado'), mira: q('.mira'), ctx: q('.radar').getContext('2d') });
    });
    if (n === 2) { const dv = document.createElement('div'); dv.className = 'divisor'; c.appendChild(dv); }
    H.util.$('hudNivel').textContent = J.nivel.nombre + ' · ' + J.nivel.fecha;
    H.util.$('hudMensaje').style.opacity = 0; this.tMsg = 0;
  },
  mensaje(txt, seg = 3.5) { const m = H.util.$('hudMensaje'); m.textContent = txt; m.style.opacity = 1; this.tMsg = seg; },
  flotante(txt, idx = 0) {
    const p = this.pan.find(x => x.j === idx); if (!p) return;
    const f = document.createElement('div'); f.className = 'flot'; f.textContent = txt; p.d.appendChild(f); setTimeout(() => f.remove(), 1200);
  },
  actualizar(J, dt) {
    const $ = H.util.$;
    if (this.tMsg > 0) { this.tMsg -= dt; if (this.tMsg <= 0) $('hudMensaje').style.opacity = 0; }
    $('hudPuntaje').textContent = String(H.puntaje).padStart(6, '0');
    const remoto = H.online === 'guest' && H.red.ultimo;
    $('hudObjetivo').textContent = remoto ? remoto.obj : J.nivel.objetivoTxt(J);
    $('hudTiempo').textContent = remoto ? remoto.tie : (J.nivel.tiempoTxt ? J.nivel.tiempoTxt(J) : '');
    this.pan.forEach(p => {
      const b = J.humanos[p.j]; if (!b) return;
      const r = Math.max(0, b.hp) / b.maxHp;
      p.hp.style.width = (r * 100) + '%'; p.hp.style.background = r > 0.6 ? '#2ea3ff' : r > 0.3 ? '#ffaa22' : '#ff3322';
      p.tHp.textContent = Math.ceil(r * 100) + '%';
      const k = v => (H.util.clamp(1 - v / b.T.recarga, 0, 1) * 100) + '%';
      if (b.T.arma === 'torre') p.r1.style.width = k(b.rec); else { p.r1.style.width = k(b.recB.izq); p.r2.style.width = k(b.recB.der); }
      if (p.esp) { p.esp.style.width = (b.emb > 0 ? 100 : b.espBar * 100) + '%'; p.esp.style.background = b.emb > 0 ? '#fff' : b.espBar >= 1 ? '#ff5a2a' : '#7a4a30'; p.tEsp.textContent = b.emb > 0 ? '¡EMBISTIENDO!' : b.espBar >= 1 ? '¡LISTO!' : ''; }
      p.vel.textContent = Math.round(Math.abs(b.vel) * 0.5);
      p.vin.style.opacity = b.vivo && r < 0.3 ? (0.5 + Math.sin(J.t * 6) * 0.3) : 0;
      p.est.textContent = b.hundiendo ? 'BUQUE HUNDIDO' : b.encallado ? '¡ENCALLADO EN LOS BAJÍOS!' : b.escapado ? '¡A SALVO! LA UNIÓN ESCAPÓ' : '';
      if (p.mira) { p.mira.style.left = H.input.mousePx.x + 'px'; p.mira.style.top = H.input.mousePx.y + 'px'; }
      this.radar(p.ctx, b, J);
    });
    if (this.verQA) this.qa(J);
  },
  radar(c, b, J) {
    const R = 75, esc = R / 520, M = H.mundo;
    c.clearRect(0, 0, 150, 150); c.save(); c.beginPath(); c.arc(R, R, R - 1, 0, 7); c.clip();
    const X = x => R + (x - b.pos.x) * esc, Z = z => R - (z - b.pos.z) * esc;
    if (M.costaX) { c.fillStyle = '#b08a54'; c.fillRect(X(M.costaX), 0, 200, 150); }
    c.strokeStyle = 'rgba(120,180,240,.3)'; [25, 50, 74].forEach(r => { c.beginPath(); c.arc(R, R, r, 0, 7); c.stroke(); });
    M.bajios.forEach(j => { c.fillStyle = 'rgba(127,216,208,.55)'; c.beginPath(); c.arc(X(j.x), Z(j.z), j.r * esc, 0, 7); c.fill(); });
    if (M.zonaEscape) { const e = M.zonaEscape; c.strokeStyle = '#4fd18b'; c.setLineDash([3, 3]); c.beginPath(); c.arc(X(e.x), Z(e.z), e.r * esc, 0, 7); c.stroke(); c.setLineDash([]);
      const a = Math.atan2(e.x - b.pos.x, e.z - b.pos.z); c.fillStyle = '#4fd18b'; c.beginPath(); c.arc(R + Math.sin(a) * 68, R - Math.cos(a) * 68, 3, 0, 7); c.fill(); }
    for (const o of J.buques) {
      if (o.eliminado || o.escapado) continue;
      let x = X(o.pos.x), z = Z(o.pos.z); const dx = x - R, dz = z - R, dd = Math.hypot(dx, dz);
      if (dd > 70) { x = R + dx / dd * 70; z = R + dz / dd * 70; }
      const img = H.tex.img[o.T.sprite];
      c.save(); c.translate(x, z); c.rotate(o.rumbo);
      if (img && dd <= 70) { c.imageSmoothingEnabled = false; const h = 17, w = h * img.width / img.height; c.drawImage(img, -w / 2, -h / 2, w, h); }
      c.restore();
      c.fillStyle = o === b ? '#4fc3ff' : o.bando === b.bando ? '#4fd18b' : '#ff5544';
      c.beginPath(); c.arc(x, z, o === b ? 3 : 2.4, 0, 7); c.fill();
    }
    c.restore();
  },
  qa(J) {
    const s = H.stats, pr = s.disparos ? Math.round(s.impactos / s.disparos * 100) : 0;
    H.util.$('qa').innerHTML = `PANEL QA (F2) · ${H.VERSION}<br>FPS: ${H.fps.toFixed(0)}<br>Objetos en escena: ${J.escena ? J.escena.children.length : 0} · Buques: ${J.buques.length}<br>` +
      `Proyectiles: ${H.balas.lista.length} · Efectos: ${H.fx.lista.length}<br>Precisión: ${pr}% (${s.impactos}/${s.disparos})<br>Daño recibido: ${Math.round(s.dano)} · Hundidos: ${s.hundidos}<br>` +
      `Tiempo del nivel: ${J.t.toFixed(0)} s · Modo: ${H.modo}<br>Voz: ${H.voz.estado} · ${H.voz.infoVoz()}`;
  },
  alternarQA() { this.verQA = !this.verQA; H.util.$('qa').classList.toggle('oculto', !this.verQA); }
};
