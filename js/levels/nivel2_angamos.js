'use strict';
/* nivel2_angamos.js — Combate naval de Angamos (8 de octubre de 1879) */
H.NIVELES.push({
  id: 'angamos', nombre: 'NIVEL 2 · COMBATE NAVAL DE ANGAMOS', fecha: '8 de octubre de 1879', ambiente: 'angamos',
  DURACION: 210,
  briefing: {
    titulo: 'COMBATE NAVAL DE ANGAMOS',
    texto: 'Tras meses de correrías que mantuvieron en jaque a la escuadra chilena, el Huáscar y la corbeta Unión (capitán Aurelio García y García) navegan hacia el norte entre la neblina. ' +
      'Frente a Punta Angamos quedan atrapados entre dos divisiones: por el sur el Blanco Encalada (comodoro Galvarino Riveros), la Covadonga y el Matías Cousiño; por el norte el Cochrane (capitán Juan José Latorre), la O’Higgins y el Loa.',
    objetivo: 'Resiste con el Huáscar hasta que el reloj llegue a cero y cubre la retirada de la Unión hacia la zona de escape (boyas al norte, punto verde del radar).',
    extra: 'Los blindados chilenos tienen más casco y andanadas potentes: no te quedes quieto. En 2 jugadores, J2 lleva a la Unión a la zona de escape.',
    retratos: [['retrato_grau', 'Miguel Grau · Huáscar'], ['retrato_garcia', 'A. García y García · Unión'], ['retrato_latorre', 'J. J. Latorre · Cochrane'], ['retrato_riveros', 'G. Riveros · Blanco Encalada']]
  },
  crear(J, modo) {
    J.agregar('huascar', { jugador: 0, control: 'J', x: 0, z: -80, rumbo: 0, maq: 0.6 });
    this.uni = J.agregar('union', modo === '2P'
      ? { jugador: 1, control: 'J', x: 70, z: 0, rumbo: 0, maq: 0.6 }
      : { x: 70, z: 0, rumbo: 0, maq: 0.6, ia: { tipo: 'huir', desde: 10, maq: 0.72, error: 34, destino: [[-480, 260], [-560, 820], [-100, 1150]] } });
    const e = { rango: 180, error: 24 };
    J.agregar('blanco', { x: 140, z: -540, rumbo: 0, maq: 0.8, ia: Object.assign({ fuegoDesde: 8 }, e) });
    J.agregar('covadonga', { x: -80, z: -580, rumbo: 0, maq: 0.8, ia: Object.assign({ fuegoDesde: 8 }, e) });
    J.agregar('cousino', { x: 230, z: -640, rumbo: 0, maq: 0.8, ia: Object.assign({ fuegoDesde: 8 }, e) });
    this.restante = this.DURACION; this.ola2 = false; this.unionAviso = false;
    this.avisos = [[1.5, 'Humos al sur: ¡la división del Blanco Encalada!'], [12, 'Resiste y cubre a la Unión hasta que escape']];
  },
  objetivoTxt() { return this.uni.vivo ? 'Resiste · La Unión debe escapar al norte' : 'Resiste hasta que el reloj llegue a cero'; },
  tiempoTxt() { const s = Math.max(0, Math.ceil(this.restante)); return 'RESISTE ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
  actualizar(J, dt) {
    while (this.avisos.length && J.t >= this.avisos[0][0]) H.hud.mensaje(this.avisos.shift()[1], 5);
    this.restante -= dt;
    const hu = J.humanos[0], z = H.mundo.zonaEscape;
    if (!this.ola2 && J.t > 40) {   // segunda división: cierra la pinza por el norte
      this.ola2 = true; H.hud.mensaje('¡Más humos al noroeste: el Cochrane cierra la pinza!', 5); H.audio.campana();
      const bx = hu.pos.x - 420, bz = hu.pos.z + 520, e = { rango: 180, error: 24 };
      J.agregar('cochrane', { x: bx, z: bz, rumbo: 2.4, maq: 0.9, ia: Object.assign({}, e) });
      const o = J.agregar('ohiggins', { x: bx + 110, z: bz + 120, rumbo: 2.4, maq: 0.9, ia: Object.assign({}, e) });
      const l = J.agregar('loa', { x: bx + 220, z: bz + 170, rumbo: 2.4, maq: 0.9, ia: Object.assign({}, e) });
      if (this.uni.vivo) { o.ia.objetivo = this.uni; l.ia.objetivo = this.uni; }
    }
    if (this.uni.vivo && this.uni.control === 'J' && Math.hypot(this.uni.pos.x - z.x, this.uni.pos.z - z.z) < z.r) { this.uni.escapado = true; J.alEscapar(this.uni); }
    const enemigos = J.buques.filter(b => b.bando === 'CL' && b.vivo).length;
    const bonos = [];
    if (this.uni.escapado) bonos.push(['La Unión escapó (como en la historia)', 1500]);
    if (!hu.vivo) {
      J.terminar({ victoria: false, honor: true, titulo: 'EL HUÁSCAR HA CAÍDO', sub: 'Final histórico · Angamos, 8 de octubre de 1879', retrato: 'retrato_grau', bonos,
        historia: 'En la historia real, un proyectil del Cochrane alcanzó la torre de mando al inicio del combate y Miguel Grau murió en su puesto. La tripulación siguió combatiendo, ' +
          'cercada por la escuadra chilena, hasta que el Huáscar fue capturado. Perú y Chile recuerdan a Grau como «El Caballero de los Mares».' });
    } else if (this.restante <= 0 || (this.ola2 && enemigos === 0)) {
      bonos.push(['El Huáscar sigue a flote', 3000]);
      if (enemigos === 0) bonos.push(['Escuadra enemiga hundida', 2000]);
      J.terminar({ victoria: true, titulo: '¡EL HUÁSCAR ROMPE EL CERCO!', sub: 'Victoria alternativa · «El Caballero de los Mares»', retrato: 'retrato_grau', bonos,
        historia: 'Has cambiado la historia: en 1879 el Huáscar no logró romper el cerco de Angamos. Grau murió en combate y el monitor fue capturado; la Unión sí consiguió escapar. ' +
          'Hoy el Huáscar se conserva como buque museo y Grau es recordado por ambos países como «El Caballero de los Mares».' });
    }
  },
  alEscapar(J, b) { if (b === this.uni) { H.hud.mensaje('¡La Unión logró escapar!', 5); J.sumar(500, b.jugador === null ? 0 : b.jugador); H.audio.logro(); } }
});
