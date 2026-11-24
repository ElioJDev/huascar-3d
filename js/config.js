'use strict';
/* =========================================================
   HUÁSCAR 3D — Guerra del Pacífico 1879
   Trabajo final · Videojuegos II · UTP
   Autor: Elio José Gabancho Catunta
   config.js — espacio de nombres global, constantes y tipos de buque
   ========================================================= */
const H = {
  VERSION: 'v1.0 Final',
  G: 60,                 // gravedad de los proyectiles
  VEL_BALA: 150,         // velocidad horizontal de los proyectiles
  estado: 'CARGA',       // CARGA, PORTADA, REGISTRO, MENU, BRIEFING, JUGANDO, PAUSA, RESULTADO
  modo: '1P',            // 1P, 2P, DUELO
  online: null,          // null (local), 'host' (anfitrión J1) o 'guest' (invitado J2)
  nivelIdx: 0,
  puntaje: 0,
  perfil: { nombre: '', dni: '', sexo: '' },
  opciones: { vol: 0.8, musica: 0.6, sfx: 0.9, silencio: false },
  debug: { bot: false, pasos: 1 }
};

/* Tipos de buque (1879). arma: 'torre' (torre giratoria) o 'banda' (andanada lateral). */
H.TIPOS = {
  huascar: { nombre: 'Huáscar', clase: 'Monitor', bando: 'PE', L: 40, W: 8, hp: 150, vel: 25, giro: 0.60,
    arma: 'torre', canones: 2, recarga: 2.6, dano: 17, alcance: 330, espolon: true, sprite: 'huascar_48x96',
    modelo: { alto: 2.4, casco: 'tex_hierro', castillo: true, toldilla: true, torre: true, chimeneas: [-5], colorChim: 0xd8c690,
      mastiles: [{ z: 13, h: 19 }, { z: -11, h: 17 }], espolon: true, bandera: 'bandera_peru' } },
  independencia: { nombre: 'Independencia', clase: 'Fragata blindada', bando: 'PE', L: 48, W: 10, hp: 150, vel: 23, giro: 0.42,
    arma: 'banda', canones: 4, recarga: 4.2, dano: 9, alcance: 280, espolon: true, sprite: 'frigate_40x88',
    modelo: { alto: 4.4, casco: 'tex_hierro', chimeneas: [0], colorChim: 0x2a2a2e, portas: 6,
      mastiles: [{ z: 14, h: 24 }, { z: -2, h: 26 }, { z: -15, h: 21 }], espolon: true, bandera: 'bandera_peru' } },
  union: { nombre: 'Unión', clase: 'Corbeta', bando: 'PE', L: 44, W: 8, hp: 95, vel: 28, giro: 0.52,
    arma: 'banda', canones: 3, recarga: 3.8, dano: 7, alcance: 270, sprite: 'corvette_30x64',
    modelo: { alto: 3.6, casco: 'tex_madera_casco', chimeneas: [-1], colorChim: 0x2a2a2e, portas: 5,
      mastiles: [{ z: 13, h: 23 }, { z: -2, h: 25 }, { z: -14, h: 20 }], velas: true, bandera: 'bandera_peru' } },
  esmeralda: { nombre: 'Esmeralda', clase: 'Corbeta de madera', bando: 'CL', L: 40, W: 8, hp: 125, vel: 11, giro: 0.36,
    arma: 'banda', canones: 3, recarga: 4.6, dano: 6, alcance: 250, sprite: 'corvette_30x64', puntos: 1500,
    modelo: { alto: 3.6, casco: 'tex_madera_casco', chimeneas: [-2], colorChim: 0x1e1e22, chimDelgada: true, portas: 5,
      mastiles: [{ z: 12, h: 23 }, { z: -1, h: 25 }, { z: -13, h: 20 }], velas: true, bandera: 'bandera_chile' } },
  covadonga: { nombre: 'Covadonga', clase: 'Goleta cañonera', bando: 'CL', L: 28, W: 6, hp: 80, vel: 19, giro: 0.70,
    arma: 'banda', canones: 1, recarga: 3.6, dano: 6, alcance: 240, sprite: 'corvette_30x64', puntos: 1000,
    modelo: { alto: 2.8, casco: 'tex_madera_casco', chimeneas: [-1], colorChim: 0x1e1e22, chimDelgada: true,
      mastiles: [{ z: 7, h: 17 }, { z: -6, h: 16 }], velas: true, bandera: 'bandera_chile' } },
  cochrane: { nombre: 'Almirante Cochrane', clase: 'Blindado', bando: 'CL', L: 46, W: 11, hp: 240, vel: 23, giro: 0.46,
    arma: 'banda', canones: 3, recarga: 5.4, dano: 11, alcance: 300, espolon: true, sprite: 'battleship_52x110', puntos: 3000,
    modelo: { alto: 4.2, casco: 'tex_hierro', casamata: true, chimeneas: [-1], colorChim: 0xc8b070,
      mastiles: [{ z: 14, h: 22 }, { z: -15, h: 20 }], espolon: true, bandera: 'bandera_chile' } },
  blanco: { nombre: 'Blanco Encalada', clase: 'Blindado', bando: 'CL', L: 46, W: 11, hp: 240, vel: 21, giro: 0.44,
    arma: 'banda', canones: 3, recarga: 5.6, dano: 11, alcance: 300, espolon: true, sprite: 'battleship_52x110', puntos: 3000,
    modelo: { alto: 4.2, casco: 'tex_hierro', casamata: true, chimeneas: [-1], colorChim: 0xc8b070,
      mastiles: [{ z: 14, h: 22 }, { z: -15, h: 20 }], espolon: true, bandera: 'bandera_chile' } },
  ohiggins: { nombre: "O'Higgins", clase: 'Corbeta', bando: 'CL', L: 42, W: 8, hp: 85, vel: 22, giro: 0.5,
    arma: 'banda', canones: 2, recarga: 4.6, dano: 6, alcance: 250, sprite: 'frigate_40x88', puntos: 1200,
    modelo: { alto: 3.6, casco: 'tex_madera_casco', chimeneas: [-1], colorChim: 0x1e1e22, portas: 4,
      mastiles: [{ z: 12, h: 23 }, { z: -1, h: 24 }, { z: -13, h: 20 }], velas: true, bandera: 'bandera_chile' } },
  loa: { nombre: 'Loa', clase: 'Transporte armado', bando: 'CL', L: 40, W: 8, hp: 65, vel: 24, giro: 0.5,
    arma: 'banda', canones: 1, recarga: 4.2, dano: 6, alcance: 240, sprite: 'frigate_40x88', puntos: 900,
    modelo: { alto: 3.4, casco: 'tex_hierro', caseta: true, chimeneas: [-3], colorChim: 0x1e1e22,
      mastiles: [{ z: 12, h: 19 }, { z: -13, h: 18 }], bandera: 'bandera_chile' } },
  cousino: { nombre: 'Matías Cousiño', clase: 'Transporte', bando: 'CL', L: 38, W: 8, hp: 55, vel: 19, giro: 0.46,
    arma: 'banda', canones: 1, recarga: 5.0, dano: 5, alcance: 220, sprite: 'frigate_40x88', puntos: 800,
    modelo: { alto: 3.4, casco: 'tex_hierro', caseta: true, chimeneas: [-2], colorChim: 0x1e1e22,
      mastiles: [{ z: 11, h: 18 }, { z: -12, h: 17 }], bandera: 'bandera_chile' } }
};

H.util = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  angDif: (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b)),   // a - b en (-PI, PI]
  rnd: (a, b) => a + Math.random() * (b - a),
  $: id => document.getElementById(id)
};
