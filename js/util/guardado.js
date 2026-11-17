'use strict';
/* guardado.js — perfil, opciones y puntajes en localStorage (solo en este dispositivo) */
H.guardado = {
  _leer(k, def) { try { const v = localStorage.getItem('huascar3d_' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
  _escribir(k, v) { try { localStorage.setItem('huascar3d_' + k, JSON.stringify(v)); } catch (e) { /* almacenamiento no disponible */ } },
  cargar() {
    Object.assign(H.opciones, this._leer('opciones', {}));
    H.opciones.silencio = false;                       // el silencio (tecla M) no se conserva entre sesiones
    if (H.opciones.musica < 0.3) H.opciones.musica = 0.6;
    Object.assign(H.perfil, this._leer('perfil', {}));
  },
  opciones() { this._escribir('opciones', H.opciones); },
  perfil() {   // el DNI se guarda enmascarado
    const p = H.perfil;
    this._escribir('perfil', { nombre: p.nombre, sexo: p.sexo, dni: p.dni ? '****' + String(p.dni).slice(-4) : '' });
  },
  puntajes() { return this._leer('puntajes', []); },
  agregarPuntaje(reg) {
    const l = this.puntajes(); l.push(reg); l.sort((a, b) => b.puntaje - a.puntaje);
    this._escribir('puntajes', l.slice(0, 8));
  }
};
