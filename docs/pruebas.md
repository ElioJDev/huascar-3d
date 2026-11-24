# Lista de pruebas

**A** = prueba automática ya ejecutada (Chromium, `tools/`). **M** = prueba manual que debe hacer Elio antes de sustentar.

| # | Prueba | Tipo | Resultado |
|---|---|---|---|
| 1 | Carga de recursos y portada con título e integrante | A | OK |
| 2 | Registro: DNI con menos de 8 dígitos bloquea «Continuar» | A | OK |
| 3 | Registro: DNI de 8 dígitos + sexo habilita «Continuar» | A | OK |
| 4 | Menú, Historia, Controles, Créditos, Opciones, Puntajes | A | OK |
| 5 | Nivel 1 completo en 1 jugador (bot) sin errores | A | OK |
| 6 | Nivel 2 completo en 1 jugador (bot): final histórico y victoria alternativa | A | OK |
| 7 | 2 jugadores en pantalla dividida (dos cámaras, dos HUD) | A | OK |
| 8 | Duelo: rondas y pantalla de ganador | A | OK |
| 9 | Pausa (P) y salir al menú | A | OK |
| 10 | Panel QA (F2) | A | OK |
| 11 | 0 errores en la consola durante todo el recorrido | A | OK |
| 12 | Micrófono: decir una frase y que el juego la repita con voz masculina | M | |
| 13 | Igual con sexo femenino (cambia la voz) | M | |
| 14 | Negar el permiso del micrófono → aparece el aviso y la opción de escribir | M | |
| 15 | Comandos de voz en juego (V): fuego, espolón, avante, alto, pausa | M | |
| 16 | Música, cañón, explosiones, campana; tecla M silencia | M | |
| 17 | Nivel 1 y 2 jugados a mano en 1 jugador; espolonazo a la Esmeralda | M | |
| 18 | Niveles 1 y 2 con dos personas en el mismo teclado | M | |
| 19 | Juego publicado en GitHub Pages, probado en Chrome y en Edge | M | |
| 20 | FPS ≥ 50 en la PC de la sustentación (F2) | M | |

## Multijugador en línea (rama multijugador-online)
| # | Prueba | Tipo | Resultado |
|---|---|---|---|
| 21 | Crear sala, unirse con el código y con el enlace ?sala= | A (2 navegadores + servidor PeerJS local) | OK |
| 22 | Cooperativo Iquique: posiciones de los 4 buques iguales en ambos lados (diferencia ≤ 1 unidad) | A | OK |
| 23 | Controles del J2 llegan al anfitrión (movimiento y disparos) | A | OK |
| 24 | Pausa pedida por el invitado y reanudación | A | OK |
| 25 | Final de nivel, resultado en ambos y paso al Nivel 2 | A | OK |
| 26 | Duelo: rondas y ganador en ambos lados | A | OK |
| 27 | Angamos: la segunda oleada aparece también en el invitado | A | OK |
| 28 | Desconexión del invitado: el anfitrión vuelve al menú con aviso | A | OK |
| 29 | Partida real entre dos redes distintas (casa / hotspot) | M | |
