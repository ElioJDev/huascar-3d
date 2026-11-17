'use strict';
/* voz.js — Reconocimiento de voz (SpeechRecognition) y repetición con voz masculina/femenina (speechSynthesis)
   según el sexo que figura en el DNI del jugador. */
H.voz = {
  Rec: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  soportaSintesis: 'speechSynthesis' in window,
  voces: [], elegida: null, tono: 1, modoVoz: '—', estado: 'inactivo', rec: null,
  FEM: /helena|sabina|laura|paulina|m[oó]nica|elvira|dalia|elena|camila|paloma|luc[ií]a|marisol|sof[ií]a|carmen|francisca|catalina|paola|ximena|elsa|female|mujer|femenin/i,
  MAS: /pablo|ra[uú]l|jorge|[aá]lvaro|diego|alex|carlos|juan|enrique|alonso|tom[aá]s|gonzalo|mateo|lorenzo|jaime|\bmale|hombre|masculin/i,
  init() {
    if (!this.soportaSintesis) return;
    const cargar = () => { this.voces = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)); if (H.perfil.sexo) this.elegirVoz(H.perfil.sexo); };
    cargar(); speechSynthesis.addEventListener('voiceschanged', cargar);
  },
  /* Elige una voz en español del género pedido; si no existe, ajusta el tono (pitch) como respaldo. */
  elegirVoz(sexo) {
    const re = sexo === 'F' ? this.FEM : this.MAS, otra = sexo === 'F' ? this.MAS : this.FEM;
    const pref = v => (/es[-_]PE/i.test(v.lang) ? 0 : /es[-_](MX|US|419|CL|CO|AR)/i.test(v.lang) ? 1 : 2);
    const lista = this.voces.slice().sort((a, b) => pref(a) - pref(b));
    let v = lista.find(x => re.test(x.name) && !(sexo === 'M' && this.FEM.test(x.name)));
    if (v) { this.elegida = v; this.tono = 1; this.modoVoz = 'voz nativa ' + (sexo === 'F' ? 'femenina' : 'masculina'); }
    else {
      // Respaldo: las voces sin nombre de género (p. ej. «Google español») suelen ser femeninas
      v = lista.find(x => !otra.test(x.name)) || lista[0] || null;
      this.elegida = v; this.tono = sexo === 'F' ? 1.35 : 0.55;
      this.modoVoz = 'tono ajustado a voz ' + (sexo === 'F' ? 'femenina' : 'masculina');
    }
    return this.elegida;
  },
  infoVoz() { return this.soportaSintesis ? ((this.elegida ? this.elegida.name : 'voz por defecto') + ' · ' + this.modoVoz) : 'síntesis de voz no disponible'; },
  hablar(texto, alTerminar) {
    if (!this.soportaSintesis || !texto) { if (alTerminar) alTerminar(); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      if (this.elegida) { u.voice = this.elegida; u.lang = this.elegida.lang; } else u.lang = 'es-PE';
      u.pitch = this.tono; u.rate = 1; u.volume = H.opciones.silencio ? 0 : Math.min(1, H.opciones.vol + 0.2);
      this.estado = 'sintetizando';
      u.onend = u.onerror = () => { this.estado = 'inactivo'; if (alTerminar) alTerminar(); };
      speechSynthesis.speak(u);
    } catch (e) { this.estado = 'inactivo'; if (alTerminar) alTerminar(); }
  },
  /* Escucha una frase. cb: { parcial(txt), final(txt), error(msg), fin() } */
  escuchar(cb) {
    if (!this.Rec) { cb.error && cb.error('Este navegador no reconoce voz. Usa Chrome o Edge.'); return false; }
    this.detener();
    const r = new this.Rec(); this.rec = r;
    r.lang = 'es-PE'; r.interimResults = true; r.maxAlternatives = 1; r.continuous = false;
    let final = '';
    r.onstart = () => { this.estado = 'reconociendo'; };
    r.onresult = e => {
      let parcial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript; else parcial += e.results[i][0].transcript;
      }
      cb.parcial && cb.parcial((final + ' ' + parcial).trim());
    };
    r.onerror = e => {
      const m = { 'not-allowed': 'Permiso de micrófono denegado. Actívalo en el candado de la barra de direcciones.',
        'service-not-allowed': 'El reconocimiento de voz está bloqueado en este navegador.',
        'no-speech': 'No se escuchó nada. Intenta de nuevo, más cerca del micrófono.',
        'audio-capture': 'No se encontró un micrófono.', 'network': 'El reconocimiento de voz necesita conexión a internet.' };
      if (e.error !== 'aborted') cb.error && cb.error(m[e.error] || ('Error de voz: ' + e.error));
    };
    r.onend = () => { this.estado = 'inactivo'; this.rec = null; if (final.trim()) cb.final && cb.final(final.trim()); cb.fin && cb.fin(); };
    try { r.start(); return true; } catch (e) { cb.error && cb.error('No se pudo iniciar el micrófono.'); return false; }
  },
  detener() { if (this.rec) { try { this.rec.stop(); } catch (e) { /* ya detenido */ } } },
  /* Interpreta un comando de voz dentro del juego. Devuelve la acción o null. */
  comando(txt) {
    const t = (txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/fuego|dispar|canon/.test(t)) return 'fuego';
    if (/espolon|embest|embist/.test(t)) return 'espolon';
    if (/pausa|deten el juego/.test(t)) return 'pausa';
    if (/avante|adelante|avanza/.test(t)) return 'avante';
    if (/\balto\b|para|detente|frena/.test(t)) return 'alto';
    return null;
  },
  tratamiento() { return H.perfil.sexo === 'F' ? 'comandanta' : 'comandante'; }
};
