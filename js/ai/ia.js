'use strict';
/* ia.js — comportamiento de los buques controlados por la máquina
   tipos: 'combate' (acercarse y presentar la banda), 'ancla' (defender una zona), 'huir' (seguir una ruta de escape) */
H.ia = {
  objetivo(b, buques) {
    const o = b.ia.objetivo;
    if (o && o.vivo) return o;
    let mejor = null, dm = 1e9;
    for (const x of buques) if (x.vivo && x.bando !== b.bando) { const d = x.pos.distanceTo(b.pos); if (d < dm) { dm = d; mejor = x; } }
    return mejor;
  },
  actualizar(b, dt, J) {
    if (!b.vivo) return;
    const U = H.util, T = b.T, ia = b.ia, o = this.objetivo(b, J.buques);
    let deseo = b.rumbo, maq = 0.4, d = 1e9;
    if (o) d = o.pos.distanceTo(b.pos);
    const hacia = (x, z) => Math.atan2(x - b.pos.x, z - b.pos.z);
    if (ia.tipo === 'huir' && (!ia.desde || J.t >= ia.desde)) {
      const w = ia.destino[ia.i];
      if (!w) { b.escapado = true; J.alEscapar(b); return; }
      deseo = hacia(w[0], w[1]); maq = ia.maq || 0.85;
      if (Math.hypot(w[0] - b.pos.x, w[1] - b.pos.z) < 45) ia.i++;
    } else if (ia.tipo === 'ancla') {
      const c = ia.centro, dc = Math.hypot(c[0] - b.pos.x, c[1] - b.pos.z);
      deseo = hacia(c[0], c[1]) + (dc < ia.radio ? Math.PI / 2 : 0.5); maq = 0.6;
    } else if (o) {
      const a = hacia(o.pos.x, o.pos.z);
      if (d > ia.rango * 1.3) { deseo = a; maq = 0.95; }
      else {
        const perp = d < ia.rango * 0.55 ? 2.0 : Math.PI / 2;   // muy cerca: abrir distancia
        const o1 = a + perp, o2 = a - perp;
        deseo = Math.abs(U.angDif(o1, b.rumbo)) < Math.abs(U.angDif(o2, b.rumbo)) ? o1 : o2; maq = 0.65;
      }
    }
    // Evitar la costa, los límites del mapa y los bajíos
    const l = H.mundo.lim, m = 90;
    if (l && ia.tipo !== 'huir') {
      if (b.pos.x > l.x1 - m) deseo = -Math.PI / 2; else if (b.pos.x < l.x0 + m) deseo = Math.PI / 2;
      if (b.pos.z > l.z1 - m) deseo = Math.PI; else if (b.pos.z < l.z0 + m) deseo = 0;
    }
    if (ia.evitaBajios) for (const bj of H.mundo.bajios) { const db = Math.hypot(bj.x - b.pos.x, bj.z - b.pos.z); if (db < bj.r + 70) { deseo = Math.atan2(b.pos.x - bj.x, b.pos.z - bj.z); maq = 0.7; } }
    // Evitar abordar a otros buques
    for (const x of J.buques) if (x !== b && !x.eliminado && !x.escapado) {
      const dd = x.pos.distanceTo(b.pos);
      if (dd < 60) { const lc = b.local(x.pos); if (lc.lz > 0) { deseo = b.rumbo + (lc.lx > 0 ? -1.2 : 1.2); break; } }
    }
    const dif = U.angDif(deseo, b.rumbo);
    b.timon = U.clamp(dif * 2.5, -1, 1); b.maq = maq;
    // Fuego con anticipación (lead) y error que crece con la distancia
    if (o && d < T.alcance && (!ia.fuegoDesde || J.t >= ia.fuegoDesde)) {
      const lead = o.pos.clone().addScaledVector(o.frente(), o.vel * (d / H.VEL_BALA) * 0.85);
      const err = ia.error + d * 0.07;
      if (T.arma === 'banda') { const r = b.ladoHacia(lead); if (r.enArco) b.dispararBanda(r.lado, lead, err); }
      else { b.apuntarTorre(lead); if (b.torreAlineada()) b.dispararTorre(d, err * 0.5); }
    }
  }
};
