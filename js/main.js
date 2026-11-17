'use strict';
/* main.js — arranque, máquina de estados y bucle principal
   Estados: CARGA → PORTADA → REGISTRO → MENU → BRIEFING → JUGANDO ⇄ PAUSA → RESULTADO */
(function () {
  const $ = H.util.$, qs = new URLSearchParams(location.search);
  H.debug.bot = qs.has('bot'); H.debug.pasos = parseInt(qs.get('rapido') || '1', 10);
  H.fps = 60;
  const renderer = H.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: qs.has('captura') });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = !qs.has('sinsombras');
  $('lienzo').appendChild(renderer.domElement);
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); H.juego.redimensionar(); });

  H.guardado.cargar(); H.input.init(); H.audio.init(); H.voz.init(); H.pantallas.init();

  H.tex.cargar(k => { $('cargaBar').style.width = Math.round(k * 100) + '%'; }, () => {
    H.juego.iniciarDiorama(); H.pantallas.irPortada();
    if (qs.has('nivel')) { H.perfil.sexo = H.perfil.sexo || 'M'; H.modo = qs.get('modo') || '1P'; H.nivelIdx = parseInt(qs.get('nivel'), 10) || 0; H.pantallas.briefing(); if (qs.has('ya')) H.pantallas.zarpar(); }
    requestAnimationFrame(bucle);
  });

  // Teclas globales
  let vozActiva = false;
  function teclas() {
    const I = H.input, P = H.pantallas, menu = H.estado === 'PORTADA' || H.estado === 'BRIEFING' || H.estado === 'RESULTADO';
    const enter = menu && (I.pulsada('Enter') || I.pulsada('NumpadEnter'));
    if (I.pulsada('KeyM')) H.audio.silenciar();
    if (I.pulsada('F2')) H.hud.alternarQA();
    if (H.estado === 'PORTADA' && (enter || I.abajo('Space'))) { H.audio.desbloquear(); P.irRegistro(); }
    else if (H.estado === 'BRIEFING' && enter) P.zarpar();
    else if (H.estado === 'RESULTADO' && enter) P.trasResultado();
    else if (H.estado === 'JUGANDO' && (I.pulsada('KeyP') || I.pulsada('Escape'))) P.pausa(true);
    else if (H.estado === 'PAUSA' && (I.pulsada('KeyP') || I.pulsada('Escape'))) P.pausa(false);
    // Comando de voz (mantener V) — solo en 1 jugador
    if (H.estado === 'JUGANDO' && H.modo === '1P') {
      if (I.abajo('KeyV') && !vozActiva && H.voz.Rec) {
        vozActiva = true; $('hudVoz').classList.remove('oculto'); $('hudVozTxt').textContent = 'Escuchando… (fuego, espolón, avante, alto, pausa)';
        H.voz.escuchar({
          parcial: t => { $('hudVozTxt').textContent = '«' + t + '»'; },
          final: t => { const c = H.juego.comandoVoz(t); $('hudVozTxt').textContent = c ? 'Orden: ' + c.toUpperCase() : 'No entendí: «' + t + '»'; },
          error: m => { H.hud.mensaje(m, 4); },
          fin: () => { setTimeout(() => { vozActiva = false; $('hudVoz').classList.add('oculto'); }, 900); }
        });
      } else if (!I.abajo('KeyV') && vozActiva && H.voz.estado === 'reconociendo') H.voz.detener();
    }
  }

  const reloj = new THREE.Clock();
  function bucle() {
    requestAnimationFrame(bucle);
    const dt = Math.min(reloj.getDelta(), 0.05);
    H.fps = H.fps * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
    teclas();
    if (H.estado === 'JUGANDO' || H.juego.diorama) for (let i = 0; i < H.debug.pasos; i++) { if (H.estado === 'JUGANDO' || H.juego.diorama) H.juego.actualizar(H.debug.pasos > 1 ? 0.033 : dt); }
    else if (H.estado === 'RESULTADO') { H.fx.actualizar(dt); }
    H.juego.render(renderer);
    H.input.finFrame();
  }
})();
