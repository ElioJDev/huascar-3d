'use strict';
/* duelo.js — Duelo 1 vs 1 en pantalla dividida: Huáscar (J1) contra Almirante Cochrane (J2), al mejor de 3 rondas */
H.DUELO = {
  id: 'duelo', nombre: 'DUELO 1 vs 1', fecha: 'Huáscar contra Cochrane', ambiente: 'duelo',
  briefing: {
    titulo: 'DUELO DE BLINDADOS',
    texto: 'Dos jugadores en el mismo teclado. J1 comanda el monitor Huáscar (torre giratoria y espolón) y J2 el blindado Almirante Cochrane (andanadas de banda y espolón). ' +
      'En Angamos, el Cochrane y el Huáscar se enfrentaron de verdad; aquí lo deciden ustedes.',
    objetivo: 'Hunde al buque rival. Gana quien venza en 2 rondas.',
    extra: 'J1: W/S, A/D, Q/E torre, Espacio fuego, F espolón · J2: flechas, Enter fuego, coma y punto para elegir banda, Shift derecho espolón.',
    retratos: [['retrato_grau', 'J1 · Miguel Grau · Huáscar'], ['retrato_latorre', 'J2 · J. J. Latorre · Cochrane']]
  },
  victorias: [0, 0], ronda: 1, espera: 0,
  crear(J) {
    if (!J.enRonda) { this.victorias = [0, 0]; this.ronda = 1; }
    J.enRonda = true; this.espera = 0;
    J.agregar('huascar', { jugador: 0, control: 'J', x: -220, z: 0, rumbo: Math.PI / 2, maq: 0.4, hpMul: 1.2 });
    J.agregar('cochrane', { jugador: 1, control: 'J', x: 220, z: 0, rumbo: -Math.PI / 2, maq: 0.4 });
    H.hud.mensaje && J.camaras.length && H.hud.mensaje('RONDA ' + this.ronda, 2.5);
  },
  objetivoTxt() { return 'Ronda ' + this.ronda + ' · J1 ' + this.victorias[0] + ' — ' + this.victorias[1] + ' J2'; },
  actualizar(J, dt) {
    const a = J.humanos[0], b = J.humanos[1];
    if (this.espera > 0) {
      this.espera -= dt;
      if (this.espera <= 0) {
        if (Math.max(this.victorias[0], this.victorias[1]) >= 2) {
          const g = this.victorias[0] > this.victorias[1] ? 0 : 1; J.enRonda = false;
          J.terminar({ victoria: true, espera: 0.5, titulo: '¡GANA EL JUGADOR ' + (g + 1) + '!', sub: (g === 0 ? 'Huáscar' : 'Almirante Cochrane') + ' vence ' + this.victorias[g] + ' a ' + this.victorias[1 - g],
            retrato: g === 0 ? 'retrato_grau' : 'retrato_latorre', historia: 'En el combate real de Angamos, el Cochrane del capitán Latorre y el Blanco Encalada rindieron al Huáscar tras una resistencia que ambos bandos reconocieron como heroica.' });
        } else { this.ronda++; J.nuevaRonda(); }
      }
      return;
    }
    if (!a.vivo || !b.vivo) {
      const g = a.vivo ? 0 : 1; this.victorias[g]++; this.espera = 4;
      H.hud.mensaje('Ronda para el JUGADOR ' + (g + 1), 3.5); H.audio.logro();
    }
  }
};
