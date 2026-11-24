# HUÁSCAR 3D — Guerra del Pacífico 1879

Videojuego 3D de combate naval basado en una historia real del Perú: los combates de **Iquique** (21 de mayo de 1879) y **Angamos** (8 de octubre de 1879).

- **Autor (único integrante):** Elio José Gabancho Catunta
- **Curso:** Videojuegos II — Universidad Tecnológica del Perú (2026)
- **Tecnología:** JavaScript + Three.js r149 (WebGL), Web Speech API, Web Audio API. Sin instalación.
- **Juego en línea (GitHub Pages):** `https://eliojdev.github.io/huascar-3d/`

## Cómo ejecutarlo en la PC
El micrófono y las texturas necesitan un servidor (HTTPS o `localhost`); **no funciona con doble clic en `index.html`**.

1. Doble clic en `iniciar_servidor.bat` (usa Python o Node).
2. Abrir **Chrome o Edge** en `http://localhost:8080`.

## Qué incluye
| Requisito del curso | Dónde está |
|---|---|
| Reconoce la voz y repite lo hablado según el género (H/M) del DNI | Pantalla «Registro del comandante» (`js/voice/voz.js`) + comandos de voz en juego (tecla V) |
| 2 niveles con efectos y sonidos | Nivel 1 Iquique, Nivel 2 Angamos (`js/levels/`) |
| Pantalla de inicio con título e integrante | Portada |
| Historia real | Guerra del Pacífico; pantalla «Historia» y textos de cada batalla |
| Sprites y texturas en Pixel Art (PNG y JPG) | `assets/pixelart/png`, `assets/pixelart/jpg`, `entregables/capturas_pixelart` |
| Efectos | Explosiones, fogonazos, humo, columnas de agua, estela, sacudida de cámara, hundimiento, niebla |
| Multijugador | Local (pantalla dividida) y **en línea desde otra PC** (WebRTC): cooperativo y Duelo 1 vs 1 |
| Calidad total (Deming) | Panel QA (F2), `docs/registro_pdca.md`, `docs/pruebas.md` |
| Modelo de negocio | `docs/modelo_negocio.md` |

## Multijugador en línea (desde otra computadora)
1. **Jugador 1 (anfitrión):** Menú → **EN LÍNEA · 2 JUGADORES** → **CREAR SALA**. Aparece un código de 5 caracteres; con **COPIAR ENLACE** se copia el enlace directo.
2. **Jugador 2:** abre el enlace (o el juego + **UNIRSE** con el código) desde su propia PC, en cualquier lugar.
3. El anfitrión elige el modo (cooperativo Iquique, cooperativo Angamos o duelo) y pulsa **INICIAR**.

Funciona con WebRTC (biblioteca PeerJS): las dos computadoras se conectan directamente y el anfitrión ejecuta la partida. Si una red bloquea la conexión (algunas redes de empresas o universidades), usa el hotspot del celular en una de las dos PCs.

Controles del jugador 2 en línea: W/S máquinas · A/D timón · Clic o Espacio fuego · Q/E babor/estribor · F espolón · P pausa.

## Controles
| Acción | 1 jugador | J1 (2 jugadores) | J2 (2 jugadores) |
|---|---|---|---|
| Máquinas avante / atrás | W / S | W / S | ↑ / ↓ |
| Timón | A / D | A / D | ← / → |
| Apuntar | Mouse | Q / E giran la torre | coma / punto: banda izq. / der. |
| Disparar | Clic | Espacio | Enter |
| Espolonazo | E | F | Shift derecho |
| Comando de voz | V (mantener): fuego, espolón, avante, alto, pausa | — | — |
| Pausa / Panel QA / Silencio | P / F2 / M | | |

## Estructura
```
index.html · css/ · js/ (config, util, audio, voice, fx, world, ships, combat, ai, ui, levels, scenes, main)
assets/ (pixelart, audio, fonts) · docs/ · entregables/ · tools/ (generador de pixel art y pruebas)
```

## Publicar en GitHub Pages
1. Crear un repositorio público `huascar-3d` y subir todo el contenido de esta carpeta (el `index.html` en la raíz).
2. Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
3. Abrir `https://eliojdev.github.io/huascar-3d/` en Chrome y probar micrófono, audio, 1 jugador y 2 jugadores.

## Créditos
Three.js (MIT) · PeerJS (MIT) · Fuente Press Start 2P (SIL OFL) · Audio: ver `CREDITOS_AUDIO.md`.
