# Registro PDCA — Calidad total según W. Edwards Deming

Cada iteración del desarrollo siguió el ciclo **Planificar – Hacer – Verificar – Actuar**. Las verificaciones se hicieron con pruebas automáticas en Chromium (script `tools/prueba.py` y `tools/capturas.py`), con un «bot» que juega solo (`?bot`) y con el panel QA del juego (F2).

| # | Planificar (objetivo y criterio) | Hacer | Verificar (datos) | Actuar |
|---|---|---|---|---|
| 1 | Base del juego: carga, portada con título e integrante, máquina de estados. Criterio: navegación sin errores. | `index.html`, `main.js`, `pantallas.js`, diorama 3D de portada. | Carga completa, 0 errores de consola. La portada se veía muy oscura. | Se aclaró el ambiente «atardecer» y el velo de la portada. |
| 2 | Voz + DNI: validar 8 dígitos, sexo, reconocer y repetir con voz H/M. | `voz.js`, pantalla de registro, respaldo por tono y por texto. | DNI de 4 dígitos rechazado, de 8 aceptado; cambia la voz al cambiar el sexo. El micrófono real no se puede probar en automático. | Queda como prueba manual obligatoria en Chrome y Edge (ver `pruebas.md`). |
| 3 | Buques de 1879 con texturas pixel art. Criterio: cada buque reconocible. | `modelos.js`, `generar_pixelart.py` (36 PNG + JPG). | Capturas revisadas: las vergas del Huáscar eran demasiado anchas. | Se redujo el aparejo de los buques sin velas. |
| 4 | Nivel 1 Iquique completable. | IA «ancla» y «huir», espolón, bajíos de Punta Gruesa. | Bot: victoria en 44 s con solo 18 de daño → demasiado fácil y corto. | Esmeralda con más casco (hay que usar el espolón), Covadonga más resistente, enemigos más precisos. |
| 5 | Nivel 2 Angamos: resistir y cubrir a la Unión. Criterio: difícil pero posible. | Dos divisiones en pinza, reloj, zona de escape. | Bot con error enemigo 44: hundió 4 buques y recibió 56 de daño (muy fácil). Con error 20: hundió 5 y cayó a los 104 s. | Error ajustado a 24 y blindados con 240 de casco. |
| 6 | Multijugador en pantalla dividida y duelo. | Dos cámaras con `setScissor`, HUD por jugador, rondas. | El panel de J2 quedaba tapado por el marcador central; la tecla Enter de J2 no disparaba porque la consumía el menú. | Panel de J2 a la derecha; Enter solo se lee como menú fuera del juego. Duelo verificado: 2 rondas → «Gana el jugador 1». |
| 7 | Audio, efectos y QA. | Sonidos sintetizados, sacudida de cámara, viñeta, panel F2. | El brillo especular del mar deslumbraba; el símbolo ★ no existe en la fuente pixel. | Menos brillo; se cambió el símbolo. |
| 8 | Publicación y entregables. | README, créditos, documentación, capturas. | Pendiente: GitHub Pages y pruebas manuales. | Completar la lista de `pruebas.md` antes de la sustentación. |

## Principios de Deming aplicados
1. **Constancia en el propósito:** un mismo objetivo desde el Avance 1 (juego naval histórico), mejorado en cada entrega.
2. **Adoptar la nueva filosofía:** cada defecto encontrado se corrige en la misma iteración, no se deja «para después».
3. **No depender de la inspección final:** la calidad se construye con el panel QA y el bot disponibles durante todo el desarrollo.
5. **Mejorar constantemente:** 8 ciclos PDCA documentados con datos.
6. **Formación:** aprendizaje aplicado de Three.js, Web Speech API y pixel art.
10. **Sin eslóganes, con datos:** el balance se decidió con mediciones (tiempo, daño, buques hundidos), no por intuición.
12. **Orgullo por el trabajo:** arte propio, historia tratada con respeto y créditos claros.
14. **La transformación es tarea de todos:** las estadísticas de cada partida y la opinión de los jugadores alimentan el siguiente ciclo.

## Indicadores
| Indicador | Meta | Estado |
|---|---|---|
| Errores en consola | 0 | Cumplido en las pruebas automáticas |
| FPS | ≥ 50 en laptop común | Medir con F2 en la PC de la sustentación (en el servidor de pruebas, sin tarjeta gráfica, dio 20–37) |
| Reconocimiento de voz | ≥ 8 de 10 frases | Pendiente de prueba manual |
| Victoria en nivel 1 / nivel 2 | ≥ 70 % / 30–50 % | Pendiente de pruebas con jugadores |
