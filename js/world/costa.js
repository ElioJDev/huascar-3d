'use strict';
/* costa.js — cielo, luces, niebla y escenarios: bahía de Iquique, Punta Angamos y mar abierto */
H.mundo = {
  grupo: null, cfg: null, costaX: null, bajios: [], lim: null, sol: null,
  AMBIENTES: {
    iquique: { cielo: 0x9fd0ee, niebla: [350, 1500], sol: 0xfff0d0, solInt: 1.0, hemi: 0.8, agua: 0xffffff, olas: 0.55, costa: 380, lim: { x0: -900, x1: 360, z0: -1000, z1: 800 } },
    angamos: { cielo: 0xb9c3c9, niebla: [140, 780], sol: 0xe8e8e0, solInt: 0.7, hemi: 0.9, agua: 0xb4c4cc, olas: 1.25, costa: 720, lim: { x0: -900, x1: 700, z0: -900, z1: 1300 } },
    atardecer: { cielo: 0xf2b078, niebla: [300, 1400], sol: 0xffc080, solInt: 1.3, hemi: 1.25, agua: 0xfff0e0, olas: 0.8, lim: { x0: -9e5, x1: 9e5, z0: -9e5, z1: 9e5 } },
    duelo: { cielo: 0x8fc0e0, niebla: [300, 1300], sol: 0xfff0d0, solInt: 1.0, hemi: 0.8, agua: 0xffffff, olas: 0.8, lim: { x0: -450, x1: 450, z0: -450, z1: 450 } }
  },
  crear(escena, tipo) {
    const c = this.cfg = this.AMBIENTES[tipo]; this.tipo = tipo;
    this.grupo = new THREE.Group(); escena.add(this.grupo);
    escena.background = new THREE.Color(c.cielo); escena.fog = new THREE.Fog(c.cielo, c.niebla[0], c.niebla[1]);
    this.grupo.add(new THREE.HemisphereLight(0xdfefff, 0x2a4860, c.hemi));
    const sol = this.sol = new THREE.DirectionalLight(c.sol, c.solInt);
    sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
    Object.assign(sol.shadow.camera, { left: -140, right: 140, top: 140, bottom: -140, near: 10, far: 700 });
    sol.shadow.camera.updateProjectionMatrix();
    this.grupo.add(sol, sol.target);
    H.oceano.crear(this.grupo, c.agua, c.olas);
    this.costaX = c.costa || null; this.lim = c.lim; this.bajios = []; this.zonaEscape = null;
    if (tipo === 'iquique') this._iquique(); else if (tipo === 'angamos') this._angamos(); else if (tipo === 'duelo') this._boyasLimite();
  },
  _caja(w, h, d, tex, rx, ry, x, y, z, color) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ map: H.tex.rep(tex, rx, ry), color: color || 0xffffff }));
    m.position.set(x, y, z); this.grupo.add(m); return m;
  },
  _plano(tex, w, h, x, y, z, rotY) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: H.tex.get(tex), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.y = rotY; this.grupo.add(m); return m;
  },
  _acantilados(x0, z0, z1, semilla, color) {
    let s = semilla; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let z = z0; z < z1;) {
      const w = 70 + r() * 80, h = 26 + r() * 46, d = 90 + r() * 60;
      this._caja(d, h, w, 'tex_costa', Math.round(d / 16), Math.round(h / 16) || 1, x0 + d / 2 + r() * 20, h / 2 - 2, z + w / 2, color);
      const h2 = h + 40 + r() * 70;   // cerros del fondo
      this._caja(160, h2, w * 1.4, 'tex_costa', 8, Math.round(h2 / 20), x0 + 190 + r() * 60, h2 / 2 - 2, z + w / 2, 0xd8c0a0);
      z += w * 0.92;
    }
  },
  _boya(x, z) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: H.tex.get('icono_boya'), transparent: true }));
    s.scale.set(7, 7, 1); s.position.set(x, 3, z); this.grupo.add(s); return s;
  },
  _iquique() {
    const X = this.costaX;
    this._caja(70, 3, 1900, 'tex_arena', 4, 100, X + 30, 0.2, -100);            // playa
    this._acantilados(X + 40, -1050, 850, 7);
    // Puerto de Iquique: casitas pixel art, muelle y faro
    for (let i = 0; i < 6; i++) this._plano('casas_iquique', 44, 22, X + 6 + (i % 2) * 14, 12 + (i % 2) * 5, -100 + i * 40, -Math.PI / 2);
    this._caja(60, 2.4, 7, 'tex_cubierta', 8, 1, X - 22, 1.6, 20);                // muelle
    for (let i = 0; i < 5; i++) this._caja(1.2, 6, 1.2, 'tex_madera_casco', 1, 1, X - 48 + i * 12, -1, 23.5);
    this._plano('faro', 12, 36, X + 4, 19, -150, -Math.PI / 2);
    // Punta Gruesa y sus bajíos (al sur)
    this._caja(90, 16, 120, 'tex_costa', 6, 1, X - 6, 5, -520);
    this._caja(50, 8, 70, 'tex_costa', 3, 1, X - 50, 2, -560);
    this.bajios = [{ x: X - 95, z: -520, r: 62 }, { x: X - 80, z: -620, r: 55 }];
    this.bajios.forEach(b => { for (let a = 0; a < 6; a++) this._boya(b.x + Math.cos(a) * b.r, b.z + Math.sin(a) * b.r); });
    // Agua clara sobre el bajío
    this.bajios.forEach(b => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(b.r, 18), new THREE.MeshBasicMaterial({ color: 0x7fd8d0, transparent: true, opacity: 0.35, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(b.x, 1.6, b.z); this.grupo.add(m);
    });
  },
  _angamos() {
    const X = this.costaX;
    this._acantilados(X + 10, -500, 700, 23, 0xb0a898);
    this._caja(120, 34, 200, 'tex_costa', 8, 2, X - 30, 14, 60, 0xb0a898);        // Punta Angamos
    this._plano('faro', 12, 36, X - 60, 46, 60, -Math.PI / 2);
    this.zonaEscape = { x: -100, z: 1150, r: 110 };
    for (let a = 0; a < 8; a++) this._boya(this.zonaEscape.x + Math.cos(a * 0.785) * this.zonaEscape.r, this.zonaEscape.z + Math.sin(a * 0.785) * this.zonaEscape.r);
  },
  _boyasLimite() { const l = this.lim; for (let i = 0; i <= 8; i++) { const k = i / 8; [[l.x0 + (l.x1 - l.x0) * k, l.z0], [l.x0 + (l.x1 - l.x0) * k, l.z1], [l.x0, l.z0 + (l.z1 - l.z0) * k], [l.x1, l.z0 + (l.z1 - l.z0) * k]].forEach(p => this._boya(p[0], p[1])); } },
  enBajio(x, z) { return this.bajios.some(b => Math.hypot(x - b.x, z - b.z) < b.r - 6); },
  seguirSol(x, z) { this.sol.position.set(x + 160, 260, z - 110); this.sol.target.position.set(x, 0, z); }
};
