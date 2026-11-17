# ESPECIFICACIÓN DEL JUEGO FINAL — "HUÁSCAR 3D: Guerra del Pacífico"

**Curso:** Videojuegos II — UTP · **Autor (único integrante):** Elio José Gabancho Catunta
**Entrega:** Trabajo Final (después del Avance 1) · **Plataforma:** JavaScript + Three.js (WebGL) · **Hosting:** GitHub Pages

> Documento para quien construya el juego (Elio o un agente de IA). Contiene las decisiones tomadas, la trazabilidad con la rúbrica del profesor, el diseño del juego, la arquitectura técnica y la lista de entregables. **Léelo completo antes de escribir código.**

---

## 0. Decisiones tomadas (no reabrir)

| Tema | Decisión |
|---|---|
| Dimensión | **3D** con Three.js (se reutiliza `prototipo_3d` del Avance 1) |
| Temática | **Historia real del Perú: Guerra del Pacífico, 1879** — combate de Iquique y combate de Angamos |
| Modos | **1 jugador** (contra IA) y **2 jugadores locales** (mismo teclado, pantalla dividida) |
| Integrantes | Solo **Elio José Gabancho Catunta** |
| Hosting | **GitHub Pages** (HTTPS: necesario para el micrófono) |
| Lenguaje | JavaScript puro (ES2020, sin bundler) + Three.js local |
| Autor de calidad | **William Edwards Deming** (PDCA + 14 principios), igual que el Avance 1 |
| Voz / DNI | El jugador ingresa **DNI (8 dígitos) y sexo H/M** como figura en su DNI; el juego reconoce su voz y la **repite con voz masculina o femenina** |
| Gráficos | 3D, pero **todo el arte visible se crea en Pixel Art** (texturas, sprites, retratos, UI) y se exporta en PNG y JPG. Ver §5 |

### Supuestos que Elio debe confirmar (si no responde, se aplican tal cual)
- Modelo de negocio: juego educativo **freemium** (ver §9).
- La estructura del PPT continúa después de “Estado del Arte (3 autores)”: la captura del profesor está cortada. **Elio debe pasar el resto de la estructura** (p. ej., metodología, desarrollo, resultados, conclusiones, referencias).
- Fecha de entrega/sustentación: por confirmar.

---

## 1. Trazabilidad con las indicaciones del profesor

| # | Requisito del profesor | Cómo se cumple | Sección |
|---|---|---|---|
| R1 | Identificar la voz del usuario y repetir lo hablado según su género (H/M) según DNI | Pantalla “Registro del Comandante”: DNI + sexo; Web Speech API reconoce la voz y `speechSynthesis` la repite con voz H o M. Además, comandos de voz en juego | §4 |
| R2 | Juego de temática diversa con efectos y sonidos, **2 niveles** | Nivel 1: Iquique (21/05/1879). Nivel 2: Angamos (08/10/1879). Efectos y audio en §6 | §3, §6 |
| R3 | Personajes y escenarios que permitan la funcionalidad y la demostración | Buques históricos jugables y enemigos, costa de Iquique y Punta Angamos, retratos de comandantes | §3, §5 |
| R4 | Pantalla de inicio con título e integrantes | Portada 3D con título, subtítulo, “Desarrollado y sustentado por: Elio José Gabancho Catunta” | §2 |
| R5 | Modelo de negocio | Lean Canvas en el PPT y en la documentación | §9 |
| R6 | Unity (C#) o JavaScript | JavaScript + Three.js | §7 |
| R7 | Basado en una historia real del Perú o del mundo | Guerra del Pacífico, Grau y el Huáscar, con datos históricos entre niveles | §3 |
| R8 | Sprites de jugador, enemigo, escenarios y elementos en **Pixel Art / Pixel Edit**; publicar archivos, capturas, JPG y PNG | Texturas, sprites, retratos e iconos pixel art en `assets/pixelart/` (PNG + JPG + .pyxel/.piskel + capturas del editor) | §5 |
| R9 | **Insertar efectos** | Fogonazos, humo, explosiones con spritesheet pixel art, columnas de agua, estela, sacudida de cámara, hundimiento, partículas, lluvia/niebla en Angamos | §6 |
| R10 | **Modo multijugador** | 2 jugadores locales en pantalla dividida (cooperativo histórico) + duelo versus opcional | §3.4 |
| R11 | Autor de calidad total y sus principios | Deming: PDCA por iteración, panel QA (F2), métricas, registro de pruebas | §10 |
| E1 | Capturas de la puesta en marcha | Carpeta `entregables/capturas/` | §11 |
| E2 | Archivos del proyecto o URL de descarga (Drive público) | Repo GitHub + ZIP en Drive público | §11 |
| E3 | Video explicativo y demostrativo | Guion en §11 | §11 |
| E4 | Publicar en hosting remoto | GitHub Pages | §8 |
| E5 | PPT con la estructura indicada | Esquema en §12 | §12 |

---

## 2. Flujo de pantallas

```
[Carga] → [Portada] → [Registro del Comandante (voz + DNI)] → [Menú principal]
   Menú: 1 Jugador | 2 Jugadores (Coop) | Duelo 1v1 | Controles | Créditos | Historia
→ [Briefing Nivel 1 con retrato y datos históricos] → [Nivel 1: Iquique]
→ [Resultado + dato histórico] → [Briefing Nivel 2] → [Nivel 2: Angamos]
→ [Final: Victoria / Derrota con cita de Grau] → [Puntajes] → [Menú]
Durante el juego: P = Pausa (Continuar / Reiniciar / Menú) · F2 = Panel QA · M = Silenciar
```

**Portada (R4):** fondo 3D animado (Huáscar navegando al atardecer, cámara orbitando), título **“HUÁSCAR 3D”**, subtítulo **“Guerra del Pacífico · 1879”**, bloque **“Integrante: Elio José Gabancho Catunta”**, curso y universidad, botón **“PRESIONA ENTER / CLIC PARA COMENZAR”**, música épica.
**Créditos:** autor, curso, docente (Elio indica nombre), fuentes de audio con licencia, Three.js (MIT).

---

## 3. Diseño del juego

### 3.1 Buques (modelos 3D low-poly, fieles a la época; NO acorazados modernos)
El prototipo actual tiene acorazados del siglo XX (3 torretas triples, radar). **Hay que rehacer los modelos** para 1879:

| Buque | Bando | Tipo real | Rasgos del modelo | Armas en el juego |
|---|---|---|---|---|
| **Huáscar** | Perú (jugador 1) | Monitor de torre | Francobordo bajo, **una torre giratoria (Coles) con 2 cañones**, espolón en la proa, una chimenea, 2 mástiles con aparejo, torre de mando, bandera peruana | Torre (sigue al mouse), **Espolonazo** (E) |
| **Independencia** | Perú (jugador 2, nivel 1) | Fragata blindada | Casco alto, 3 mástiles, una chimenea, baterías laterales | Andanada lateral (izq/der) |
| **Unión** | Perú (jugador 2, nivel 2) | Corbeta | Casco esbelto, 3 mástiles, una chimenea | Andanada lateral; más rápida |
| **Esmeralda** | Chile | Corbeta de madera | 3 mástiles con velas, casco de madera, una chimenea delgada | Andanada lateral |
| **Covadonga** | Chile | Goleta cañonera | Pequeña, 2 mástiles | Cañón de proa/popa; muy maniobrable |
| **Almirante Cochrane** / **Blanco Encalada** | Chile | Blindados de batería central | Casco grande, una chimenea, mástiles, casamata central | Andanadas potentes |
| **O’Higgins**, **Loa**, **Matías Cousiño** | Chile | Corbeta / transporte | Variantes menores | Andanada ligera |

Todos los modelos son procedurales en Three.js (geometrías simples) **con texturas pixel art** (§5), `magFilter = NearestFilter`.

### 3.2 Nivel 1 — Combate naval de Iquique (21 de mayo de 1879)
- **Escenario:** bahía de Iquique, costa desértica (acantilados ocres), puerto con casitas pixel art, mar calmo, mañana despejada.
- **Fuerzas:** Huáscar (+ Independencia en coop) vs **Esmeralda** y **Covadonga**.
- **Objetivo principal:** hundir la Esmeralda. Bonus histórico: hundirla con **espolonazo** (+puntaje y logro “Espolón de Grau”).
- **Objetivo secundario:** dañar o perseguir a la Covadonga antes de que escape (en coop, el jugador 2 con la Independencia; peligro de **bajíos de Punta Gruesa**: zona marcada donde encallar = derrota del jugador 2, recreando el hecho histórico).
- **Dificultad:** baja; tutorial contextual (mensajes cortos sobre los controles).

### 3.3 Nivel 2 — Combate naval de Angamos (8 de octubre de 1879)
- **Escenario:** mar abierto frente a Punta Angamos, oleaje mayor, neblina matinal, humo de chimeneas.
- **Fuerzas:** Huáscar (+ Unión en coop) vs **Blanco Encalada, Cochrane, Covadonga, O’Higgins, Loa, Matías Cousiño** (aparecen por oleadas desde el norte y el sur, como la pinza histórica).
- **Objetivo:** **resistir 4 minutos** y lograr que la **Unión escape** a la zona de escape (en 1 jugador la Unión es controlada por la IA y huye; en coop la controla el jugador 2). Puntaje extra por cada buque enemigo hundido. Si el Huáscar resiste hasta el final → **Victoria alternativa “El Caballero de los Mares”**. Si el Huáscar cae → final histórico, respetuoso, con la cita de Grau.
- **Dificultad:** alta; los blindados chilenos tienen más casco y andanadas fuertes.

### 3.4 Modos de juego (R10)
| Modo | Descripción | Cámara |
|---|---|---|
| **1 Jugador** | Huáscar con teclado y mouse; aliados controlados por la IA | Tercera persona |
| **2 Jugadores — Cooperativo** | J1 = Huáscar, J2 = Independencia (N1) / Unión (N2). Comparten objetivos y puntaje | **Pantalla dividida vertical** (`renderer.setScissor`/`setViewport`) |
| **Duelo 1v1** (extra, rápido) | J1 Huáscar vs J2 Cochrane en arena; gana quien hunda al otro (3 rondas) | Pantalla dividida |

### 3.5 Controles
| Acción | 1 Jugador | J1 (2P) | J2 (2P) |
|---|---|---|---|
| Avante / atrás | W / S | W / S | ↑ / ↓ |
| Timón | A / D | A / D | ← / → |
| Apuntar torre / elegir banda | Mouse | Q / E giran la torre | , / . (banda izq/der) |
| Disparar | Clic izq. | Espacio | Enter |
| Espolonazo | E (con barra cargada) | F | Shift der. |
| Comando de voz | V (mantener) | — | — |
| Pausa / QA / Silencio | P / F2 / M | P / F2 / M | — |

### 3.6 Mecánicas
- Navegación con inercia; el giro depende de la velocidad.
- Artillería **balística** (parábola, gravedad); la torre del Huáscar tiene arco limitado y recarga lenta (fiel a la época); las andanadas laterales disparan perpendiculares al casco.
- **Espolonazo:** embestida a alta velocidad; daño enorme si impacta de proa; se carga con el tiempo.
- Daño localizado simple: casco (HP); con HP < 30 % sale humo y la velocidad baja.
- Hundimiento animado (escora + se sumerge + burbujas/humo).
- IA: patrulla → aproximación → maniobra para presentar la banda (andanada) → mantener distancia; huida de buques débiles (Covadonga); objetivo de escape (Unión).
- Puntaje: hundir (por tipo), impactos, precisión, tiempo, bonus de espolón, sin daño. **Tabla de puntajes** en `localStorage` (con try/catch).
- **Datos históricos** entre niveles (2–3 frases + retrato pixel art de Grau, Prat, Condell, etc.). Tono respetuoso con ambos bandos.

---

## 4. Módulo de voz y DNI (R1) — detalle

**Pantalla “Registro del Comandante”** (después de la portada):
1. Campo **Nombre** (opcional) y **DNI**: 8 dígitos; validación en vivo (solo números, longitud 8).
2. **Sexo según DNI:** selector `Masculino (M)` / `Femenino (F)` (el número de DNI peruano no codifica el sexo; el dato se toma del campo “Sexo” del documento).
3. Botón **🎤 Hablar** → `SpeechRecognition` (`webkitSpeechRecognition`), `lang = 'es-PE'` (respaldo `es-ES`), `interimResults = true`, muestra la transcripción en pantalla.
4. Al terminar, el juego **repite lo dicho** con `speechSynthesis`:
   - Elegir voz según sexo: buscar en `speechSynthesis.getVoices()` voces `es-*` cuyo nombre contenga nombres femeninos (Helena, Sabina, Laura, Paulina, Monica, Elvira, Dalia, “Female”) o masculinos (Pablo, Raul, Jorge, Alvaro, Diego, “Male”); manejar el evento `voiceschanged`.
   - **Respaldo** si no hay voz del género: misma voz con `pitch` 0.7 (M) o 1.4 (F).
   - Texto: “Comandante, usted dijo: …”.
5. Indicador visual: ícono de micrófono pixel art animado, nivel de audio (opcional con `AudioContext` + `AnalyserNode`), mensajes de error claros (sin permiso de micrófono, navegador no compatible → recomendar Chrome/Edge).
6. **Saludo:** “Bienvenido, comandante [nombre]” / “Bienvenida, comandanta [nombre]” con la voz del género.
7. **Comandos de voz en juego** (mantener V): “fuego”, “espolón”, “pausa”, “avante”, “alto”. El juego confirma con voz (“¡Fuego!”). Suma a la demostración.
8. Guardar el perfil (nombre, sexo, DNI enmascarado `****1234`) solo en `localStorage`; **no enviar datos a ningún servidor**. Mostrar el aviso “Los datos se usan solo en este dispositivo”.

Requisitos: funciona en **Chrome/Edge** y en **HTTPS** (GitHub Pages) o `localhost`. Para pruebas locales: `npx serve` o la extensión Live Server (con `file://` el micrófono no funciona de forma fiable).

---

## 5. Pixel Art (R8) — cómo cumplirlo en un juego 3D

**Regla:** toda imagen del juego es pixel art hecha en Pyxel Edit (o Piskel/Aseprite) y se usa en 3D con `texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;`.

| Recurso | Tamaño sugerido | Uso |
|---|---|---|
| Textura casco hierro (Huáscar, blindados) | 32×32 tileable | Material del casco |
| Textura casco madera (Esmeralda, Covadonga) | 32×32 | Casco de madera |
| Cubierta de tablones | 32×32 | Cubierta |
| Velas | 32×32 | Mástiles/velas |
| Banderas Perú y Chile (época 1879) | 24×16 | Plano animado en el mástil |
| Retratos: Grau, Moore, García y García (Unión), Prat, Condell, Latorre | 48×48 | Briefings, HUD, créditos |
| Explosión (spritesheet) | 32×32×8 y 48×48×10 (**ya existen**) | `THREE.Sprite` animado |
| Fogonazo (muzzle flash) | 24×24×6 (**ya existe**) | Sprite |
| Proyectil | 16×16×4 (**ya existe**) | Sprite |
| Columna de agua / salpicadura | 16×32×6 | Sprite |
| Humo | 16×16×6 | Sprite |
| Costa/acantilado, casitas de Iquique, faro | 32×32 / 64×32 | Texturas y billboards |
| Logo del título “HUÁSCAR 3D” | 256×64 | Portada |
| Íconos HUD: casco, ancla, cañón, espolón, micrófono | 16×16 | HUD |
| Sprites top-down de buques (**ya existen**: huascar, frigate, corvette, battleship) | — | Minimapa/radar |

**Publicación:** `assets/pixelart/png/`, `assets/pixelart/jpg/` (mismas imágenes en JPG, fondo sólido), `assets/pixelart/fuentes/` (.pyxel/.piskel) y `entregables/capturas_pixelart/` (capturas del editor con cada sprite abierto). Si un agente de IA genera los PNG por código, **Elio debe abrirlos en Pyxel Edit**, retocarlos y tomar las capturas para la evidencia.

---

## 6. Efectos y audio (R2, R9)

**Visuales:** fogonazo + humo al disparar; trayectoria con estela tenue; columnas de agua al fallar; explosión pixel art al impactar; fuego y humo continuo con daño alto; **sacudida de cámara** en impactos y espolonazo; escora y hundimiento con burbujas; estela de proa y popa; olas animadas; ciclo de luz por nivel (mañana en Iquique, neblina en Angamos); viñeta roja cuando el casco está bajo; transiciones con fundido entre pantallas; texto flotante “+300”.

**Audio (Web Audio API / `HTMLAudioElement`):**
- Música: portada/menú y una por nivel (puede reutilizarse `Royalty_Free_Music.mp3` si su licencia lo permite; si no, CC0 de Pixabay/Freesound/OpenGameArt).
- SFX: cañón (**ya existe** `disparo_canon.wav`), explosión, salpicadura, espolonazo (metal), motor/vapor en loop, campana de barco al iniciar, alarma con casco bajo, ambiente de guerra (**ya existe** `environment_war.wav`), olas, UI clic.
- Voz sintetizada para las confirmaciones (§4).
- Volumen general/música/SFX en **Opciones**; tecla M silencia todo. Desbloquear el audio con el primer clic.
- Registrar en `CREDITOS_AUDIO.md` la fuente y la licencia de cada archivo.

---

## 7. Arquitectura técnica

### 7.1 Estructura del repositorio (raíz = sitio de GitHub Pages)
```
huascar-3d/
├── index.html
├── css/style.css
├── js/
│   ├── lib/three.min.js        (r149, ya disponible en prototipo_3d/js)
│   ├── main.js                 bucle principal, máquina de estados
│   ├── config.js               constantes, controles, VERSION
│   ├── scenes/                 portada.js, registro.js, menu.js, briefing.js, nivel.js, resultado.js
│   ├── voice/voz.js            reconocimiento + síntesis + comandos
│   ├── world/oceano.js, costa.js, cielo.js
│   ├── ships/modelos.js        constructores de buques 1879
│   ├── ships/buque.js          física, daño, hundimiento
│   ├── ai/ia.js                comportamientos enemigos/aliados
│   ├── combat/proyectiles.js, espolon.js
│   ├── fx/efectos.js, sprites.js (spritesheets pixel art)
│   ├── audio/audio.js
│   ├── ui/hud.js, radar.js, pausa.js, qa.js
│   ├── levels/nivel1_iquique.js, nivel2_angamos.js
│   └── util/input.js, guardado.js, splitscreen.js
├── assets/
│   ├── pixelart/png | jpg | fuentes
│   ├── audio/
│   └── fonts/                  (fuente pixel, p. ej. “Press Start 2P”, licencia OFL, local)
├── docs/                       documentación, modelo de negocio, registro PDCA
├── entregables/                capturas, capturas_pixelart, video (enlace), ppt
├── README.md                   descripción, controles, enlace al juego, créditos
└── CREDITOS_AUDIO.md
```
Sin bundler: scripts clásicos en orden (o ES modules con `type="module"`; en ese caso se exige servidor local para probar). Todas las rutas son **relativas** (GitHub Pages sirve el juego en `/<repo>/`).

### 7.2 Núcleo
- Máquina de estados: `CARGA → PORTADA → REGISTRO → MENU → BRIEFING → JUGANDO ⇄ PAUSA → RESULTADO → FINAL`.
- Bucle `requestAnimationFrame`, `dt` limitado a 0.05 s.
- Pantalla dividida: un `renderer`, dos cámaras, `setScissorTest(true)`; HUD duplicado por mitad.
- Carga de recursos con `THREE.LoadingManager` y barra de progreso pixel art.
- **Rendimiento:** meta ≥ 50 FPS en una laptop común; reutilizar geometrías/materiales; pool de proyectiles y partículas; océano con menos segmentos en pantalla dividida; sombras solo de la luz principal.

### 7.3 Reutilización del Avance 1
De `Avance1_ElioGabancho/prototipo_3d/js/game.js` se reutilizan: océano con olas (`waveH`), disparo balístico (`fireSalvo`), colisión en coordenadas locales (`hitShip`), efectos, cámara de seguimiento, radar y panel QA. Se **reemplazan** los modelos de buques (por los de 1879), el sistema de oleadas (por niveles históricos) y la portada.

---

## 8. Publicación en GitHub Pages (E4)
1. Crear el repo público `huascar-3d` en la cuenta de Elio.
2. Subir el contenido (la raíz debe tener `index.html`).
3. Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
4. URL: `https://<usuario>.github.io/huascar-3d/`. Probar en Chrome: micrófono, audio, 1P, 2P.
5. Poner la URL en el README, en el PPT, en el video y en la entrega.
6. ZIP del proyecto en Google Drive con acceso público “Cualquiera con el enlace” (E2).

---

## 9. Modelo de negocio (R5) — Lean Canvas (supuesto, confirmar)
- **Problema:** la historia del Perú se enseña de forma poco interactiva; pocos juegos peruanos de calidad sobre hechos reales.
- **Segmentos:** estudiantes de 10–17 años, colegios (curso de Historia), público aficionado a juegos de estrategia/historia, peruanos en el extranjero.
- **Propuesta de valor:** aprender la Guerra del Pacífico jugando: batallas reales en 3D, datos históricos, modo cooperativo para el aula, sin instalación (navegador).
- **Solución:** juego web gratuito + versión educativa con guía docente y estadísticas.
- **Canales:** GitHub Pages / itch.io, redes sociales (TikTok/YouTube con clips), ferias educativas, alianzas con colegios y la Marina de Guerra del Perú (Museo Naval) para difusión.
- **Ingresos:** freemium → gratis 2 batallas; **licencia institucional** para colegios (más batallas, panel docente); **DLC de batallas** (Punta Gruesa, Arica, Callao); donaciones; merchandising digital (wallpapers pixel art).
- **Costos:** hosting (gratis inicialmente), dominio, música con licencia, tiempo de desarrollo, marketing.
- **Métricas clave:** usuarios activos, partidas completadas, tiempo de juego, colegios suscritos, conversión a licencia.
- **Ventaja diferencial:** contenido histórico peruano + 3D en navegador + cooperativo local.

---

## 10. Calidad total — Deming (R11)
- **PDCA por iteración** (documentar 3 ciclos como mínimo en `docs/registro_pdca.md`): *Plan* (objetivo de la iteración + criterio de aceptación) → *Do* (implementar) → *Check* (pruebas y métricas del panel QA) → *Act* (corregir/estandarizar).
- **Panel QA (F2):** FPS, objetos en escena, proyectiles, precisión, daño recibido, tiempo del nivel, estado de la voz (reconociendo/sintetizando/voz elegida).
- **Lista de pruebas** (`docs/pruebas.md`): portada y créditos; registro con DNI inválido/válido; voz H y M; sin permiso de micrófono; 1P nivel 1 y 2 completos; 2P coop ambos niveles; duelo; pausa/reinicio; audio on/off; GitHub Pages en Chrome y Edge; 0 errores en consola.
- **Indicadores:** ≥ 50 FPS; 0 errores en consola; reconocimiento de voz correcto en ≥ 8 de 10 frases de prueba; tasa de victoria del nivel 1 ≥ 70 % y del nivel 2 entre 30 y 50 % en pruebas.
- Relacionar en el PPT al menos 6 de los 14 principios con acciones concretas (como en el Avance 1).

---

## 11. Entregables finales
1. **Capturas de la puesta en marcha** (`entregables/capturas/`): portada, registro de voz (H y M), menú, briefing, nivel 1, nivel 2, pantalla dividida, pausa, panel QA, final, GitHub Pages funcionando (barra de dirección visible), configuración de Pages.
2. **Archivos del proyecto:** repo de GitHub + ZIP en Drive público.
3. **Video (5–8 min):** (1) presentación y objetivo; (2) portada e integrante; (3) registro: decir una frase con perfil M y luego F, y el juego la repite con cada voz; (4) nivel 1 con espolonazo; (5) nivel 2; (6) modo 2 jugadores; (7) efectos y sonido; (8) pixel art en Pyxel Edit; (9) panel QA y Deming; (10) URL de GitHub Pages; (11) cierre.
4. **Hosting remoto:** URL de GitHub Pages.
5. **PPT** (§12).
6. **Pixel art:** PNG, JPG, archivos fuente y capturas del editor.

---

## 12. Estructura del PPT (según el profesor; completar con lo que falta de la captura)
1. **Título** — HUÁSCAR 3D: Guerra del Pacífico · Elio José Gabancho Catunta.
2. **Descripción** — qué es, género, plataforma, modos.
3. **Objetivo general y específicos** — General: desarrollar un videojuego 3D web, basado en los combates navales de Iquique y Angamos, con reconocimiento de voz y modo multijugador, aplicando los principios de calidad total de Deming. Específicos: (a) módulo de voz con identificación del género según DNI; (b) 2 niveles históricos con efectos y sonido; (c) arte pixel art; (d) modo cooperativo local; (e) publicación en GitHub Pages; (f) aplicación del PDCA.
4. **Marco teórico (3 autores)** — sugeridos: **Jesse Schell** (*The Art of Game Design*: lentes de diseño); **Raph Koster** (*A Theory of Fun*: diversión como aprendizaje); **W. E. Deming** (*Out of the Crisis*: calidad total) o **Mihaly Csikszentmihalyi** (teoría del *flow*, equilibrio entre dificultad y habilidad).
5. **Estado del arte (3 autores/trabajos)** — sugeridos: **James Paul Gee** (2003, aprendizaje con videojuegos); **Kurt Squire** (2004–2011, videojuegos de historia en el aula: *Civilization III*); **Marc Prensky** (2001, *Digital Game-Based Learning*). Complementar con juegos similares: *Ultimate Admiral: Age of Sail*, *Naval Action*, *World of Warships* y juegos educativos peruanos, si los hay. **Verificar las referencias antes de presentarlas.**
6. *(Resto de la estructura: pendiente de la captura completa del profesor.)* Probable: metodología (PDCA/Deming), arquitectura, desarrollo y pixel art, módulo de voz, modelo de negocio, demostración, resultados de pruebas, conclusiones, referencias APA.

---

## 13. Plan de construcción sugerido (iteraciones PDCA)
1. **Iteración 1 — Base:** reestructurar el repo (§7.1), máquina de estados, portada, menú, créditos, carga. *Check:* navegación completa sin errores.
2. **Iteración 2 — Voz/DNI:** pantalla de registro completa (§4). *Check:* voces H/M en Chrome y Edge.
3. **Iteración 3 — Buques 1879 + pixel art:** modelos y texturas; sprites de efectos. *Check:* capturas de cada buque.
4. **Iteración 4 — Nivel 1 Iquique** (1P): escenario, IA, espolón, objetivos, briefing. *Check:* nivel completable.
5. **Iteración 5 — Nivel 2 Angamos** (1P): oleadas en pinza, escape de la Unión, finales. *Check:* nivel completable y balanceado.
6. **Iteración 6 — Multijugador:** pantalla dividida coop + duelo. *Check:* 2P en ambos niveles.
7. **Iteración 7 — Audio, efectos finales, opciones, puntajes, QA.** *Check:* lista de pruebas §10.
8. **Iteración 8 — Publicación y entregables:** GitHub Pages, capturas, README, docs, PPT, guion de video.

**Criterio de terminado:** se cumplen todos los requisitos R1–R11 y E1–E5 de la tabla §1, 0 errores en consola, juego publicado y probado desde la URL pública.
