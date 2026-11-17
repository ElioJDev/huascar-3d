'use strict';
/* modelos.js — modelos 3D low-poly de los buques de 1879, con texturas pixel art.
   Convención: proa hacia +Z, babor (izquierda) hacia +X, cubierta a la altura «alto». */
H.modelos = {
  _mat(tex, rx, ry, color) { return new THREE.MeshLambertMaterial({ map: H.tex.rep(tex, rx, ry), color: color || 0xffffff }); },
  _liso(color) { return new THREE.MeshLambertMaterial({ color }); },
  _perfil(L, W) {
    const s = new THREE.Shape();
    s.moveTo(0, -L / 2);
    s.quadraticCurveTo(W * 0.5, -L * 0.3, W / 2, -L * 0.08);
    s.lineTo(W / 2, L * 0.36);
    s.quadraticCurveTo(W * 0.46, L / 2, 0, L / 2);
    s.quadraticCurveTo(-W * 0.46, L / 2, -W / 2, L * 0.36);
    s.lineTo(-W / 2, -L * 0.08);
    s.quadraticCurveTo(-W * 0.5, -L * 0.3, 0, -L / 2);
    return s;
  },
  _extr(L, W, alto, mat, y) {
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(this._perfil(L, W), { depth: alto, bevelEnabled: false, curveSegments: 6 }), mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y; return m;
  },
  _caja(g, w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m; },
  _cil(g, rt, rb, h, mat, x, y, z, seg = 10) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); g.add(m); return m; },

  crear(clave) {
    const T = H.TIPOS[clave], p = T.modelo, L = T.L, W = T.W, A = p.alto;
    const g = new THREE.Group();
    const madera = p.casco === 'tex_madera_casco';
    const mCasco = this._mat(p.casco, 0.125, 0.125), mCub = this._mat('tex_cubierta', 0.125, 0.125);
    const mHierro = this._mat('tex_hierro', 2, 1), mClaro = this._mat('tex_hierro_claro', 2, 1);
    const mOsc = this._liso(0x16171b), mPalo = this._liso(0x4a3320), mRojo = this._liso(0x7a1f1f), mBlanco = this._liso(0xe6e2d2);

    // Casco: obra viva roja, costados con textura pixel art y cubierta de tablones
    g.add(this._extr(L * 0.96, W * 0.86, 1.8, mRojo, -2.6));
    g.add(this._extr(L, W, A + 1, mCasco, -1));
    const cub = this._extr(L * 0.96, W * 0.9, 0.25, mCub, A - 0.1); cub.receiveShadow = true; g.add(cub);
    if (!madera) { const f = this._extr(L * 1.004, W * 1.02, 0.35, mBlanco, A - 0.9); g.add(f); }   // franja clara

    if (p.castillo) this._caja(g, W * 0.62, 1.5, L * 0.2, mHierro, 0, A + 0.75, L * 0.3);
    if (p.toldilla) this._caja(g, W * 0.72, 1.4, L * 0.15, mHierro, 0, A + 0.7, -L * 0.37);

    // Torre giratoria Coles (Huáscar) + torre de mando
    let torre = null;
    if (p.torre) {
      torre = new THREE.Group(); torre.position.set(0, A, L * 0.1);
      this._cil(torre, 3.3, 3.4, 2.6, this._mat('tex_hierro_claro', 4, 1, 0xb8b8b0), 0, 1.3, 0, 14);
      this._cil(torre, 3.0, 3.3, 0.3, mOsc, 0, 2.75, 0, 14);
      [-0.95, 0.95].forEach(x => { const c = this._cil(torre, 0.34, 0.42, 5.2, mOsc, x, 1.45, 4.6, 8); c.rotation.x = Math.PI / 2; });
      g.add(torre);
      this._cil(g, 1.3, 1.4, 3.2, mClaro, 0, A + 1.6, L * 0.1 - 5.6, 6);
      this._cil(g, 1.5, 1.5, 0.25, mOsc, 0, A + 3.3, L * 0.1 - 5.6, 6);
    }
    // Casamata central de los blindados
    if (p.casamata) {
      this._caja(g, W * 1.1, 2.8, L * 0.3, mHierro, 0, A + 0.6, -L * 0.02);
      this._caja(g, W * 0.6, 1.6, L * 0.2, mClaro, 0, A + 2.8, -L * 0.02);
      [-1, 1].forEach(s => { for (let i = -1; i <= 1; i++) this._caja(g, 0.3, 0.9, 1.1, mOsc, s * W * 0.555, A + 0.8, -L * 0.02 + i * L * 0.09); });
    }
    if (p.caseta) { this._caja(g, W * 0.5, 2.4, L * 0.22, mClaro, 0, A + 1.2, -L * 0.05); this._caja(g, W * 0.56, 0.25, L * 0.24, mOsc, 0, A + 2.5, -L * 0.05); }
    // Portas de los cañones
    if (p.portas) [-1, 1].forEach(s => { for (let i = 0; i < p.portas; i++) this._caja(g, 0.3, 0.7, 0.9, mOsc, s * (W / 2 + 0.02), A - 1.5, -L * 0.3 + i * (L * 0.36 / Math.max(1, p.portas - 1))); });
    // Chimeneas
    p.chimeneas.forEach(z => {
      const r = p.chimDelgada ? 0.6 : 1.15, h = p.chimDelgada ? 8 : 7;
      this._cil(g, r, r * 1.08, h, this._liso(p.colorChim), 0, A + h / 2, z);
      this._cil(g, r * 1.1, r * 1.1, 0.6, mOsc, 0, A + h, z);
    });
    // Mástiles, vergas, cofas y velas
    const puntas = [];
    p.mastiles.forEach(mt => {
      this._cil(g, 0.16, 0.3, mt.h, mPalo, 0, A + mt.h / 2, mt.z, 6);
      this._cil(g, 0.8, 0.6, 0.4, mPalo, 0, A + mt.h * 0.62, mt.z, 8);
      [0.5, 0.78].forEach((k, i) => {
        const ancho = W * (p.velas ? (i ? 1.3 : 1.8) : (i ? 0.8 : 1.25));
        this._caja(g, ancho, 0.22, 0.22, mPalo, 0, A + mt.h * k, mt.z);
        if (p.velas) {
          const alto = mt.h * 0.2, v = new THREE.Mesh(new THREE.PlaneGeometry(ancho * 0.92, alto), new THREE.MeshLambertMaterial({ map: H.tex.rep('tex_vela', 2, 1), side: THREE.DoubleSide }));
          v.position.set(0, A + mt.h * k - alto / 2 - 0.2, mt.z + 0.25); g.add(v);
        }
      });
      puntas.push(new THREE.Vector3(0, A + mt.h, mt.z));
    });
    // Jarcia (estays)
    const pts = [new THREE.Vector3(0, A + 0.5, L * 0.48), ...puntas, new THREE.Vector3(0, A + 0.5, -L * 0.48)];
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x20180f })));
    puntas.forEach(pt => [-1, 1].forEach(s => g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pt, new THREE.Vector3(s * W * 0.48, A, pt.z - 2.5)]), new THREE.LineBasicMaterial({ color: 0x20180f })))));
    if (madera) { const b = this._cil(g, 0.14, 0.22, 9, mPalo, 0, A + 1.6, L * 0.5 + 2.6, 6); b.rotation.x = Math.PI / 2 - 0.3; }   // bauprés
    // Espolón
    if (p.espolon) { const e = new THREE.Mesh(new THREE.ConeGeometry(1.0, 4.5, 6), mOsc); e.rotation.x = Math.PI / 2; e.position.set(0, -0.6, L / 2 + 0.8); g.add(e); }
    // Botes
    [-1, 1].forEach(s => this._caja(g, 0.9, 0.6, 3.4, mBlanco, s * W * 0.34, A + 0.9, -L * 0.2));
    // Bandera a popa
    this._cil(g, 0.08, 0.08, 6.5, mPalo, 0, A + 3.2, -L * 0.47, 5);
    const bandera = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.1), new THREE.MeshBasicMaterial({ map: H.tex.get(p.bandera), side: THREE.DoubleSide }));
    bandera.position.set(0, A + 5, -L * 0.47 - 2.4); bandera.rotation.y = Math.PI / 2; g.add(bandera);

    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    bandera.castShadow = false;
    // Posición local de los cañones de banda (babor = +X, estribor = -X)
    const izq = [], der = [], n = T.canones, yCan = p.casamata ? A + 0.8 : A - 0.6;
    for (let i = 0; i < n; i++) {
      const z = n === 1 ? -L * 0.05 : -L * 0.28 + i * (L * 0.3 / (n - 1));
      izq.push(new THREE.Vector3(W / 2 + 0.6, yCan, z)); der.push(new THREE.Vector3(-W / 2 - 0.6, yCan, z));
    }
    const chim = new THREE.Vector3(0, A + 8, p.chimeneas[0]);
    return { grupo: g, torre, bandera, izq, der, chim, alto: A };
  }
};
