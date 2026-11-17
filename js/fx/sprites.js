'use strict';
/* sprites.js — carga de texturas pixel art (filtro NEAREST para conservar el píxel) */
H.tex = {
  mapa: {}, cache: {},
  nombres: ['tex_hierro', 'tex_hierro_claro', 'tex_madera_casco', 'tex_cubierta', 'tex_vela', 'tex_agua', 'tex_costa', 'tex_arena',
    'casas_iquique', 'faro', 'bandera_peru', 'bandera_chile', 'icono_boya',
    'explosion_32x32_x8', 'explosion_big_48x48_x10', 'muzzleflash_24x24_x6', 'projectile_16x16_x4', 'salpicadura_16x32_x6', 'humo_16x16_x6',
    'huascar_48x96', 'frigate_40x88', 'corvette_30x64', 'battleship_52x110'],
  img: {},
  cargar(progreso, fin) {
    const gestor = new THREE.LoadingManager();
    gestor.onProgress = (u, c, t) => progreso(c / t);
    gestor.onLoad = fin;
    gestor.onError = u => console.warn('No se pudo cargar', u);
    const cargador = new THREE.TextureLoader(gestor);
    this.nombres.forEach(n => {
      this.mapa[n] = cargador.load((H.TEX_DATOS && H.TEX_DATOS[n]) || ('assets/pixelart/png/' + n + '.png'), t => {
        t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
        this.img[n] = t.image;
      });
    });
  },
  get(n) { return this.mapa[n]; },
  /* Copia de la textura con repetición (para cascos, cubiertas, costa…) */
  rep(n, rx, ry) {
    const k = n + '|' + rx + '|' + ry;
    if (!this.cache[k]) {
      const t = this.mapa[n].clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
      this.cache[k] = t;
    }
    return this.cache[k];
  },
  /* Copia para un cuadro de una hoja de sprites horizontal */
  hoja(n, cuadros) {
    const t = this.mapa[n].clone(); t.repeat.set(1 / cuadros, 1); t.offset.x = 0;
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  }
};
