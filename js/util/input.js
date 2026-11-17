'use strict';
/* input.js — teclado y mouse */
H.input = {
  teclas: {}, recien: {}, mouse: new THREE.Vector2(0, 0), mousePx: { x: 0, y: 0 }, clic: false,
  init() {
    const bloquear = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'F2'];
    addEventListener('keydown', e => {
      const enTexto = e.target && e.target.tagName === 'INPUT' && e.target.type === 'text';
      if (enTexto) return;
      if (bloquear.includes(e.code)) e.preventDefault();
      if (!this.teclas[e.code]) this.recien[e.code] = true;
      this.teclas[e.code] = true;
    });
    addEventListener('keyup', e => { this.teclas[e.code] = false; });
    addEventListener('blur', () => { this.teclas = {}; });
    addEventListener('mousemove', e => {
      this.mousePx.x = e.clientX; this.mousePx.y = e.clientY;
      this.mouse.x = e.clientX / innerWidth * 2 - 1; this.mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    });
    addEventListener('mousedown', e => { if (e.button === 0) this.clic = true; });
    addEventListener('contextmenu', e => { if (H.estado === 'JUGANDO') e.preventDefault(); });
  },
  abajo(c) { return !!this.teclas[c]; },
  pulsada(c) { if (this.recien[c]) { this.recien[c] = false; return true; } return false; },
  finFrame() { this.recien = {}; this.clic = false; }
};
