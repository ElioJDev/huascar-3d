'use strict';
/* pantallas.js — portada, registro del comandante (voz + DNI), menú, briefing, pausa y resultados */
H.pantallas = {
  actual: null, previa: null, def: null,
  mostrar(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('visible'));
    this.actual = id; if (id) H.util.$(id).classList.add('visible');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    H.util.$('hud').classList.toggle('oculto', !(H.estado === 'JUGANDO' || H.estado === 'PAUSA'));
  },
  init() {
    const $ = H.util.$, clic = (el, fn) => el.addEventListener('click', () => { H.audio.desbloquear(); H.audio.clic(); fn(); });
    $('verTxt').textContent = H.VERSION + ' · JavaScript + Three.js · Chrome o Edge';
    clic($('btnComenzar'), () => this.irRegistro());
    // --- Registro ---
    const nom = $('regNombre'), dni = $('regDni');
    dni.addEventListener('input', () => { dni.value = dni.value.replace(/\D/g, '').slice(0, 8); this.validar(); });
    nom.addEventListener('input', () => this.validar());
    document.querySelectorAll('input[name=sexo]').forEach(r => r.addEventListener('change', () => {
      H.perfil.sexo = r.value; H.voz.elegirVoz(r.value);
      $('regGeneroTxt').textContent = r.value === 'F' ? 'FEMENINA' : 'MASCULINA'; $('regVozInfo').textContent = 'Voz: ' + H.voz.infoVoz(); this.validar();
    }));
    clic($('btnHablar'), () => this.hablar());
    clic($('btnRepetir'), () => { const f = $('regFrase').value.trim(); if (f) this.repetir(f); });
    clic($('btnRegOk'), () => this.registroOk());
    if (!H.voz.Rec) $('regEscribir').classList.remove('oculto');
    // --- Menú ---
    document.querySelectorAll('[data-ir]').forEach(b => clic(b, () => this.nuevaPartida(b.dataset.ir)));
    document.querySelectorAll('[data-ver]').forEach(b => clic(b, () => { if (b.dataset.ver === 'pPuntajes') this.pintarPuntajes(); this.mostrar(b.dataset.ver); }));
    document.querySelectorAll('.volver').forEach(b => clic(b, () => this.irMenu()));
    // --- Opciones ---
    const o = H.opciones, liga = (id, k) => { const s = $(id); s.value = o[k]; s.addEventListener('input', () => { o[k] = parseFloat(s.value); H.audio.aplicarVolumen(); H.guardado.opciones(); }); };
    liga('opVol', 'vol'); liga('opMus', 'musica'); liga('opSfx', 'sfx');
    clic($('btnCambiarPerfil'), () => this.irRegistro());
    // --- Briefing, pausa, resultado ---
    clic($('btnZarpar'), () => this.zarpar());
    clic($('btnContinuar'), () => this.pausa(false));
    clic($('btnReiniciar'), () => { H.puntaje = this.puntajeInicio || 0; this.zarpar(); });
    clic($('btnSalir'), () => this.irMenu());
    clic($('btnResOk'), () => this.trasResultado());
  },
  irPortada() { H.estado = 'PORTADA'; this.mostrar('pPortada'); H.audio.ponerMusica(true); },
  irRegistro() {
    const $ = H.util.$; H.estado = 'REGISTRO'; this.mostrar('pRegistro');
    $('regNombre').value = H.perfil.nombre || ''; $('regDni').value = /^\d{8}$/.test(H.perfil.dni) ? H.perfil.dni : '';
    document.querySelectorAll('input[name=sexo]').forEach(r => { r.checked = r.value === H.perfil.sexo; });
    if (H.perfil.sexo) { H.voz.elegirVoz(H.perfil.sexo); $('regVozInfo').textContent = 'Voz: ' + H.voz.infoVoz(); }
    this.validar();
  },
  validar() {
    const $ = H.util.$, dni = $('regDni'), ok = /^\d{8}$/.test(dni.value), sx = !!H.perfil.sexo;
    dni.classList.toggle('bien', ok); dni.classList.toggle('mal', dni.value.length > 0 && !ok);
    $('regAviso').textContent = !ok ? (dni.value.length ? 'El DNI debe tener exactamente 8 dígitos (' + dni.value.length + '/8).' : 'Ingresa tu DNI.') : !sx ? 'Selecciona el sexo que figura en tu DNI.' : '';
    $('btnRegOk').disabled = !(ok && sx); $('btnHablar').disabled = !sx;
    return ok && sx;
  },
  hablar() {
    const $ = H.util.$, btn = $('btnHablar'), tr = $('regTranscripcion');
    if (H.voz.estado === 'reconociendo') { H.voz.detener(); return; }
    if (!H.voz.Rec) { $('regAviso').textContent = 'Este navegador no reconoce voz: usa Chrome o Edge, o escribe la frase abajo.'; $('regEscribir').classList.remove('oculto'); return; }
    if (window.speechSynthesis) speechSynthesis.cancel();
    tr.textContent = 'Escuchando… habla ahora'; btn.classList.add('escuchando'); btn.textContent = '■ DETENER'; H.audio.musica.volume *= 0.2;
    H.voz.escuchar({
      parcial: t => { tr.textContent = '«' + t + '»'; },
      final: t => { tr.textContent = '«' + t + '»'; this.repetir(t); },
      error: m => { $('regAviso').textContent = m; tr.textContent = '…'; $('regEscribir').classList.remove('oculto'); },
      fin: () => { btn.classList.remove('escuchando'); btn.textContent = '🎤 HABLAR'; H.audio.aplicarVolumen(); }
    });
  },
  /* El juego repite lo dicho con voz masculina o femenina según el sexo del DNI */
  repetir(frase) {
    const $ = H.util.$; this.fraseDicha = frase;
    H.voz.elegirVoz(H.perfil.sexo || 'M'); $('regVozInfo').textContent = 'Repitiendo con: ' + H.voz.infoVoz();
    $('regTranscripcion').textContent = '«' + frase + '»';
    H.voz.hablar(H.voz.tratamiento() + ', usted dijo: ' + frase);
  },
  registroOk() {
    if (!this.validar()) return; const $ = H.util.$;
    H.perfil.nombre = $('regNombre').value.trim(); H.perfil.dni = $('regDni').value; H.guardado.perfil();
    H.voz.elegirVoz(H.perfil.sexo);
    H.voz.hablar((H.perfil.sexo === 'F' ? 'Bienvenida, comandanta ' : 'Bienvenido, comandante ') + (H.perfil.nombre || ''));
    this.irMenu();
  },
  irMenu() {
    H.estado = 'MENU'; H.audio.enJuego = false; H.audio.aplicarVolumen(); if (!H.juego.diorama) H.juego.iniciarDiorama();
    const p = H.perfil; H.util.$('menuSaludo').textContent = (p.sexo === 'F' ? 'Bienvenida, comandanta ' : 'Bienvenido, comandante ') + (p.nombre || '') + (p.dni ? ' · DNI ****' + String(p.dni).slice(-4) : '');
    this.mostrar('pMenu'); H.audio.ponerMusica(true);
  },
  nuevaPartida(modo) {
    H.modo = modo; H.puntaje = 0;
    const r = document.querySelector('input[name=nivelIni]:checked'); H.nivelIdx = modo === 'DUELO' ? 0 : parseInt(r ? r.value : '0', 10);
    this.briefing();
  },
  briefing() {
    const $ = H.util.$, def = this.def = H.modo === 'DUELO' ? H.DUELO : H.NIVELES[H.nivelIdx], b = def.briefing;
    H.estado = 'BRIEFING';
    $('brNivel').textContent = def.nombre + ' · ' + def.fecha + ' · ' + (H.modo === '1P' ? '1 jugador' : H.modo === '2P' ? '2 jugadores cooperativo' : 'duelo');
    $('brTitulo').textContent = b.titulo; $('brTexto').textContent = b.texto; $('brObjetivo').textContent = b.objetivo; $('brExtra').textContent = b.extra;
    $('brRetratos').innerHTML = b.retratos.map(r => `<figure><img src="assets/pixelart/png/${r[0]}.png" alt=""><figcaption>${r[1]}</figcaption></figure>`).join('');
    this.mostrar('pBriefing');
  },
  zarpar() {
    this.puntajeInicio = H.puntaje; H.estado = 'JUGANDO';
    H.juego.iniciar(this.def, H.modo); this.mostrar(null);
    H.audio.enJuego = true; H.audio.aplicarVolumen();
    if (H.modo === '1P') H.voz.hablar('A sus puestos, ' + H.voz.tratamiento());
  },
  pausa(si) {
    if (si && H.estado === 'JUGANDO') { H.estado = 'PAUSA'; this.mostrar('pPausa'); H.audio.pararMotor(); H.audio.ponerAmbiente(false); }
    else if (!si && H.estado === 'PAUSA') { H.estado = 'JUGANDO'; this.mostrar(null); H.audio.ponerAmbiente(true); }
  },
  resultado(res) {
    const $ = H.util.$, s = H.stats, pr = s.disparos ? Math.round(s.impactos / s.disparos * 100) : 0;
    H.estado = 'RESULTADO'; H.audio.pararMotor(); H.audio.ponerAmbiente(false); H.audio.enJuego = false; H.audio.aplicarVolumen(); this.res = res;
    const bonos = (res.bonos || []).slice();
    if (H.modo !== 'DUELO') { if (pr >= 30) bonos.push(['Precisión de artillería ' + pr + '%', pr * 20]); if (res.victoria && s.dano < 40) bonos.push(['Casco casi intacto', 700]); }
    bonos.forEach(b => { H.puntaje += b[1]; });
    $('resTitulo').textContent = res.titulo; $('resTitulo').style.color = res.victoria ? '#ffce54' : '#ff8a70';
    $('resSub').textContent = res.sub || ''; $('resHistoria').textContent = res.historia || ''; $('resRetrato').src = 'assets/pixelart/png/' + (res.retrato || 'retrato_grau') + '.png';
    let h = '';
    if (H.modo !== 'DUELO') {
      h += `<tr><th>Precisión</th><td>${pr}% (${s.impactos} de ${s.disparos} disparos)</td></tr><tr><th>Buques hundidos</th><td>${s.hundidos}</td></tr>` +
        `<tr><th>Espolonazos</th><td>${s.espolon}</td></tr><tr><th>Daño recibido</th><td>${Math.round(s.dano)}</td></tr><tr><th>Tiempo</th><td>${Math.round(H.juego.t)} s</td></tr>`;
      bonos.forEach(b => { h += `<tr><th>» ${b[0]}</th><td>+${b[1]}</td></tr>`; });
      h += `<tr><th>PUNTAJE</th><td><b style="color:#ffce54">${H.puntaje}</b></td></tr>`;
    }
    $('resTabla').innerHTML = h;
    const sigue = H.modo !== 'DUELO' && res.victoria && H.nivelIdx < H.NIVELES.length - 1;
    $('btnResOk').textContent = sigue ? 'SIGUIENTE BATALLA (ENTER)' : (!res.victoria && !res.honor && H.modo !== 'DUELO') ? 'REINTENTAR (ENTER)' : 'CONTINUAR (ENTER)';
    this.mostrar('pResultado');
    if (H.modo === '1P') H.voz.hablar(res.victoria ? 'Victoria, ' + H.voz.tratamiento() : res.honor ? 'El Huáscar ha caído con honor' : 'Hemos sido hundidos');
  },
  trasResultado() {
    const res = this.res; if (!res) return; this.res = null;
    if (H.modo === 'DUELO') return this.irMenu();
    if (res.victoria && H.nivelIdx < H.NIVELES.length - 1) { H.nivelIdx++; return this.briefing(); }
    if (!res.victoria && !res.honor) { H.puntaje = this.puntajeInicio || 0; return this.briefing(); }
    H.guardado.agregarPuntaje({ nombre: H.perfil.nombre || 'Comandante', puntaje: H.puntaje, modo: H.modo, fecha: new Date().toLocaleDateString('es-PE') });
    H.juego.iniciarDiorama(); H.estado = 'MENU'; this.pintarPuntajes(); this.mostrar('pPuntajes'); H.audio.ponerMusica(true);
  },
  pintarPuntajes() {
    const l = H.guardado.puntajes();
    H.util.$('tablaPuntajes').innerHTML = '<tr><th>#</th><th>Comandante</th><th>Puntaje</th><th>Modo</th><th>Fecha</th></tr>' +
      (l.length ? l.map((p, i) => `<tr><td>${i + 1}</td><td>${String(p.nombre).replace(/[<>&]/g, '')}</td><td>${p.puntaje}</td><td>${p.modo}</td><td>${p.fecha}</td></tr>`).join('') : '<tr><td colspan="5">Aún no hay puntajes. ¡Zarpa!</td></tr>');
  }
};
