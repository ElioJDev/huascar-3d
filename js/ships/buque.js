'use strict';
/* buque.js — física, armas, daño, espolón y hundimiento de un buque */
class Buque {
  constructor(clave, o = {}) {
    const T = this.T = H.TIPOS[clave];
    this.clave = clave; this.nombre = T.nombre; this.bando = o.bando || T.bando;
    this.control = o.control || 'IA'; this.jugador = o.jugador === undefined ? null : o.jugador;
    this.ia = Object.assign({ tipo: 'combate', rango: 170, error: 26, i: 0 }, o.ia || {});
    this.modelo = H.modelos.crear(clave); this.grupo = this.modelo.grupo;
    this.pos = new THREE.Vector3(o.x || 0, 0, o.z || 0); this.rumbo = o.rumbo || 0;
    this.vel = 0; this.maq = o.maq || 0; this.timon = 0;
    this.maxHp = this.hp = Math.round(T.hp * (o.hpMul || 1));
    this.rec = 1; this.recB = { izq: 1 + Math.random() * 2, der: 1 + Math.random() * 2 };
    this.torreAng = 0; this.torreObj = 0;
    this.espBar = T.espolon ? 0.5 : 0; this.emb = 0;
    this.hundiendo = 0; this.encallado = false; this.escapado = false; this.eliminado = false;
    this.tHumo = 0; this.tEstela = 0; this.porEspolon = false;
    this.colocar(0, 0);
  }
  get vivo() { return !this.hundiendo && !this.encallado && !this.escapado; }
  frente() { return new THREE.Vector3(Math.sin(this.rumbo), 0, Math.cos(this.rumbo)); }
  proa() { return this.pos.clone().addScaledVector(this.frente(), this.T.L / 2 + 2); }
  local(p) {   // coordenadas locales: lx hacia babor, lz hacia proa
    const dx = p.x - this.pos.x, dz = p.z - this.pos.z, s = Math.sin(this.rumbo), c = Math.cos(this.rumbo);
    return { lx: dx * c - dz * s, lz: dx * s + dz * c };
  }
  contiene(p, margen = 0) { const l = this.local(p); return Math.abs(l.lz) < this.T.L / 2 + margen && Math.abs(l.lx) < this.T.W / 2 + margen; }
  mundo(v) { return v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rumbo).add(this.grupo.position); }
  ladoHacia(p) { const l = this.local(p); return { lado: l.lx > 0 ? 'izq' : 'der', enArco: Math.abs(l.lz) < Math.abs(l.lx) * 1.3 }; }

  apuntarTorre(p) { this.torreObj = H.util.angDif(Math.atan2(p.x - this.pos.x, p.z - this.pos.z), this.rumbo); }
  torreAlineada() { return Math.abs(H.util.angDif(this.torreObj, this.torreAng)) < 0.07; }
  dispararTorre(dist, error = 0) {
    if (this.rec > 0 || !this.vivo || !this.modelo.torre) return false;
    this.rec = this.T.recarga;
    const a = this.rumbo + this.torreAng, dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), lat = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const base = this.mundo(this.modelo.torre.position.clone().setY(this.modelo.alto + 1.6));
    dist = H.util.clamp(dist, 30, this.T.alcance);
    [-0.95, 0.95].forEach(k => {
      const origen = base.clone().addScaledVector(dir, 7.4).addScaledVector(lat, k);
      const obj = base.clone().addScaledVector(dir, dist).addScaledVector(lat, k * 2.5);
      obj.x += H.util.rnd(-1, 1) * (2.5 + error); obj.z += H.util.rnd(-1, 1) * (2.5 + error);
      H.balas.crear(origen, obj, this, this.T.dano); H.fx.fogonazo(origen);
    });
    H.audio.canon(this.jugador !== null ? 1 : 0.6);
    if (this.jugador !== null) H.fx.sacudir(0.5, this.jugador);
    return true;
  }
  dispararBanda(lado, punto, error = 0) {
    if (this.recB[lado] > 0 || !this.vivo) return false;
    this.recB[lado] = this.T.recarga;
    const s = lado === 'izq' ? 1 : -1, lat = new THREE.Vector3(Math.cos(this.rumbo) * s, 0, -Math.sin(this.rumbo) * s);
    this.modelo[lado].forEach(c => {
      const origen = this.mundo(c);
      let obj;
      if (punto) obj = punto.clone().add(new THREE.Vector3(H.util.rnd(-1, 1) * (3 + error), 0, H.util.rnd(-1, 1) * (3 + error)));
      else obj = origen.clone().addScaledVector(lat, 150);
      const d = Math.hypot(obj.x - origen.x, obj.z - origen.z);
      if (d > this.T.alcance) obj.sub(origen).multiplyScalar(this.T.alcance / d).add(origen);
      obj.y = 0;
      H.balas.crear(origen, obj, this, this.T.dano); H.fx.fogonazo(origen.clone().addScaledVector(lat, 1.5));
    });
    H.audio.canon(this.jugador !== null ? 1 : 0.5);
    if (this.jugador !== null) H.fx.sacudir(0.5, this.jugador);
    return true;
  }
  embestir() {
    if (!this.T.espolon || this.espBar < 1 || this.emb > 0 || !this.vivo) return false;
    this.emb = 2.8; this.espBar = 0; this.maq = 1; return true;
  }
  recibirDano(d, pos, autor) {
    if (!this.vivo) return;
    this.hp -= d; H.fx.explosion(pos, false);
    if (this.jugador !== null) { H.fx.sacudir(Math.min(3, d * 0.12), this.jugador); H.stats.dano += d; }
    if (this.hp <= 0) { this.hp = 0; this.hundiendo = 0.001; H.fx.explosion(this.pos, true); H.juego.alHundir(this, autor); }
  }
  encallar() { if (!this.vivo) return; this.encallado = true; this.vel = 0; this.maq = 0; H.fx.sacudir(3, this.jugador === null ? undefined : this.jugador); H.audio.espolon(); H.juego.alEncallar(this); }
  colocar(t, dt) {
    const y = H.oceano.malla ? H.oceano.altura(this.pos.x, this.pos.z, t) * 0.5 : 0, h = this.hundiendo;
    this.grupo.position.set(this.pos.x, y - h * 11 - (this.encallado ? 0.4 : 0), this.pos.z);
    const esc = this.encallado ? 0.16 : 0;
    this.grupo.rotation.set(Math.sin(t * 1.2 + this.pos.x * 0.1) * 0.025 * H.oceano.amp - h * 0.3, this.rumbo, Math.cos(t * 1.0 + this.pos.z * 0.1) * 0.035 * H.oceano.amp + h * 0.5 + esc + this.timon * -0.05);
    this.modelo.bandera.rotation.y = Math.PI / 2 + Math.sin(t * 5 + this.pos.x) * 0.25;
    if (this.modelo.torre) this.modelo.torre.rotation.y = this.torreAng;
  }
  actualizar(dt, t) {
    const T = this.T, M = H.mundo;
    if (this.hundiendo) {
      this.hundiendo += dt * 0.3; this.vel *= 0.97;
      if (Math.random() < dt * 5) H.fx.humo(this.grupo.position.clone().setY(3), 6, 0x444444);
      if (this.hundiendo > 1.25 && !this.eliminado) { this.eliminado = true; if (this.grupo.parent) this.grupo.parent.remove(this.grupo); }
    } else if (!this.encallado && !this.escapado) {
      const danado = this.hp < this.maxHp * 0.3;
      const vMax = T.vel * (danado ? 0.72 : 1) * (this.emb > 0 ? 1.9 : 1);
      this.vel += (this.maq * vMax - this.vel) * Math.min(1, dt * (this.emb > 0 ? 2.4 : 0.6));
      this.rumbo += this.timon * T.giro * dt * (0.3 + 0.7 * Math.min(1, Math.abs(this.vel) / T.vel)) * (this.vel < -0.5 ? -1 : 1);
      if (this.emb > 0) this.emb -= dt; else if (T.espolon) this.espBar = Math.min(1, this.espBar + dt / 13);
      this.rec -= dt; this.recB.izq -= dt; this.recB.der -= dt;
      const dTorre = H.util.angDif(this.torreObj, this.torreAng); this.torreAng += Math.sign(dTorre) * Math.min(Math.abs(dTorre), 1.5 * dt);
      // Humo de chimenea y de averías
      this.tHumo -= dt;
      if (this.tHumo <= 0) {
        this.tHumo = danado ? 0.16 : 0.5;
        if (danado) { const p = this.mundo(new THREE.Vector3(H.util.rnd(-2, 2), this.modelo.alto + 2, H.util.rnd(-8, 8))); H.fx.humo(p, 5, 0x2a2a2a); if (Math.random() < 0.3) H.fx.anim('explosion_32x32_x8', 8, p, 5, 5, 0.5); }
        else if (Math.abs(this.vel) > 3) H.fx.humo(this.mundo(this.modelo.chim), 3.5, 0x555555);
      }
      // Estela
      this.tEstela -= dt;
      if (Math.abs(this.vel) > 5 && this.tEstela <= 0) {
        this.tEstela = 0.14; const f = this.frente();
        H.fx.espuma(this.pos.clone().addScaledVector(f, -T.L / 2).setY(0.9), 4);
        if (this.emb > 0) H.fx.espuma(this.pos.clone().addScaledVector(f, T.L / 2).setY(1.2), 6);
      }
    }
    if (!this.escapado) {
      const f = this.frente(); this.pos.addScaledVector(f, this.vel * dt);
      const l = M.lim;
      if (l && this.vivo) {
        if (this.pos.x < l.x0) { this.pos.x = l.x0; this.vel *= 0.9; } if (this.pos.x > l.x1) { this.pos.x = l.x1; this.vel *= 0.9; }
        if (this.pos.z < l.z0) { this.pos.z = l.z0; this.vel *= 0.9; } if (this.pos.z > l.z1) { this.pos.z = l.z1; this.vel *= 0.9; }
        if (M.bajios.length && T.L > 30 && M.enBajio(this.pos.x, this.pos.z)) this.encallar();
      }
    }
    this.colocar(t, dt);
  }
}
H.Buque = Buque;
