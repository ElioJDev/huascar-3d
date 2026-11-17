'use strict';
/* oceano.js — mar con olas animadas y textura pixel art */
H.oceano = {
  malla: null, base: null, amp: 1, TAM: 2400, SEG: 64, PASO: 150,
  crear(escena, color, amp) {
    this.amp = amp;
    const g = new THREE.PlaneGeometry(this.TAM, this.TAM, this.SEG, this.SEG); g.rotateX(-Math.PI / 2);
    const m = new THREE.MeshPhongMaterial({ map: H.tex.rep('tex_agua', 80, 80), color, specular: 0x1c2c38, shininess: 18, flatShading: true });
    this.malla = new THREE.Mesh(g, m); this.malla.receiveShadow = true; escena.add(this.malla);
    this.base = g.attributes.position.array.slice();
  },
  altura(x, z, t) {
    return (Math.sin(x * 0.02 + t * 1.1) * 1.3 + Math.cos(z * 0.025 + t * 0.9) * 1.1 + Math.sin((x + z) * 0.05 + t * 2) * 0.45) * this.amp;
  },
  actualizar(t, cx, cz) {
    const m = this.malla, p = m.geometry.attributes.position.array, b = this.base;
    m.position.x = Math.round(cx / this.PASO) * this.PASO; m.position.z = Math.round(cz / this.PASO) * this.PASO;
    for (let i = 0; i < p.length; i += 3) p[i + 1] = this.altura(b[i] + m.position.x, b[i + 2] + m.position.z, t);
    m.geometry.attributes.position.needsUpdate = true;
  }
};
