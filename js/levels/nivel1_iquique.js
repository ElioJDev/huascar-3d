'use strict';
/* nivel1_iquique.js — Combate naval de Iquique (21 de mayo de 1879) */
H.NIVELES = [];
H.NIVELES.push({
  id: 'iquique', nombre: 'NIVEL 1 · COMBATE NAVAL DE IQUIQUE', fecha: '21 de mayo de 1879', ambiente: 'iquique',
  briefing: {
    titulo: 'COMBATE NAVAL DE IQUIQUE',
    texto: 'El puerto peruano de Iquique está bloqueado por la corbeta Esmeralda (capitán Arturo Prat) y la goleta Covadonga (capitán Carlos Condell). ' +
      'El monitor Huáscar, al mando del capitán de navío Miguel Grau, y la fragata Independencia (capitán Juan Guillermo More) llegan al amanecer para romper el bloqueo.',
    objetivo: 'Hunde a la Esmeralda. Bonus histórico: húndela con el espolón. Después, alcanza a la Covadonga antes de que escape hacia el sur.',
    extra: '¡Cuidado con los bajíos de Punta Gruesa (boyas rojas)! Un buque grande que entre allí encalla, como le ocurrió a la Independencia.',
    retratos: [['retrato_grau', 'Miguel Grau · Huáscar'], ['retrato_more', 'J. G. More · Independencia'], ['retrato_prat', 'Arturo Prat · Esmeralda'], ['retrato_condell', 'Carlos Condell · Covadonga']]
  },
  crear(J, modo) {
    J.agregar('huascar', { jugador: 0, control: 'J', x: -230, z: 250, rumbo: 2.1, maq: 0.5 });
    this.ind = J.agregar('independencia', modo === '2P'
      ? { jugador: 1, control: 'J', x: -320, z: 330, rumbo: 2.1, maq: 0.5 }
      : { x: -320, z: 330, rumbo: 2.1, maq: 0.5, ia: { tipo: 'combate', rango: 150, error: 55, evitaBajios: true } });
    this.esm = J.agregar('esmeralda', { x: 250, z: 40, rumbo: -1.6, hpMul: 2.4, ia: { tipo: 'ancla', centro: [230, 30], radio: 75, error: 26, fuegoDesde: 7 } });
    this.cov = J.agregar('covadonga', { x: 225, z: -90, rumbo: 3.1, ia: { tipo: 'huir', desde: 24, maq: 0.8, error: 34, fuegoDesde: 7, destino: [[300, -330], [285, -500], [300, -640], [240, -960]] } });
    if (modo !== '2P') this.ind.ia.objetivo = this.cov;
    this.avisos = [[1.5, 'W / S: máquinas · A / D: timón'], [8, modo === '1P' ? 'Apunta la torre con el MOUSE y dispara con CLIC' : H.online ? 'J1: MOUSE y CLIC para la torre · J2: CLIC o ESPACIO dispara la banda' : 'J1: Q/E giran la torre, ESPACIO dispara · J2: ENTER dispara la banda'],
      [16, 'Con la barra de ESPOLÓN llena, embiste de proa a la Esmeralda'], [25, 'La Covadonga huye hacia el sur, pegada a la costa']];
    this.avisoCov = false; this.guion = false;
  },
  objetivoTxt() { return this.esm.vivo ? 'Hunde a la Esmeralda (bonus: con el espolón)' : 'Alcanza a la Covadonga antes de que escape'; },
  tiempoTxt(J) { const s = Math.floor(J.t); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
  actualizar(J) {
    while (this.avisos.length && J.t >= this.avisos[0][0]) H.hud.mensaje(this.avisos.shift()[1], 5);
    const hu = J.humanos[0];
    // Guion histórico (1 jugador): la Independencia persigue a la Covadonga hasta los bajíos
    if (!this.guion && this.ind.control === 'IA' && this.ind.vivo && this.cov.vivo && this.cov.pos.z < -470) {
      this.guion = true; this.ind.ia = Object.assign(this.ind.ia, { tipo: 'huir', destino: [[285, -520]], i: 0, desde: 0, evitaBajios: false, maq: 0.9 });
    }
    if (!this.esm.vivo && this.cov.vivo && !this.avisoCov) { this.avisoCov = true; H.hud.mensaje('¡La Esmeralda se hunde! Ahora, tras la Covadonga', 5); }
    if (!hu.vivo && !hu.escapado) {
      J.terminar({ victoria: false, titulo: 'EL HUÁSCAR FUE HUNDIDO', sub: 'El bloqueo de Iquique continúa', retrato: 'retrato_prat',
        historia: 'En la historia real, el Huáscar hundió a la Esmeralda después de tres espolonazos y casi cuatro horas de combate. Inténtalo de nuevo, comandante.' });
    } else if (!this.esm.vivo && !this.cov.vivo) {
      const b = [];
      if (this.esm.porEspolon) b.push(['Logro «Espolón de Grau»', 1000]);
      if (this.cov.hundiendo) b.push(['Covadonga hundida (en la historia escapó)', 500]);
      if (this.ind.vivo) b.push(['La Independencia sigue a flote (en la historia encalló)', 800]);
      J.terminar({ victoria: true, titulo: '¡BLOQUEO DE IQUIQUE ROTO!', sub: 'La Esmeralda ha sido hundida', retrato: 'retrato_grau', bonos: b,
        historia: 'El 21 de mayo de 1879 el Huáscar hundió a la Esmeralda con su espolón; el capitán Prat murió al abordar el monitor. Grau ordenó rescatar a los náufragos chilenos ' +
          'y después envió a la viuda de Prat una carta de condolencia junto con sus pertenencias. Ese mismo día, la Independencia encalló en Punta Gruesa persiguiendo a la Covadonga.' });
    }
  },
  alEncallar(J, b) {
    H.hud.mensaje(b === this.ind ? '¡La Independencia encalló en Punta Gruesa! (hecho histórico)' : '¡' + b.nombre + ' encalló en los bajíos!', 6);
  },
  alEscapar(J, b) { if (b === this.cov) H.hud.mensaje('La Covadonga escapó hacia el sur (como en la historia)', 5); }
});
