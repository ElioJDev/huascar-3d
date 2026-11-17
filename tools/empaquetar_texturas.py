# Incrusta las texturas pixel art como data-URI en js/fx/texturas_datos.js,
# para que el juego se vea bien incluso abriendo index.html con doble clic (file://).
# Ejecutar de nuevo cada vez que se retoque un PNG:  python tools/empaquetar_texturas.py
import base64, re, json
nombres = re.search(r"nombres: \[(.*?)\]", open('js/fx/sprites.js', encoding='utf-8').read(), re.S).group(1)
nombres = re.findall(r"'([^']+)'", nombres)
d = {n: 'data:image/png;base64,' + base64.b64encode(open('assets/pixelart/png/%s.png' % n, 'rb').read()).decode() for n in nombres}
open('js/fx/texturas_datos.js', 'w', encoding='utf-8').write("'use strict';\n/* Generado por tools/empaquetar_texturas.py — no editar a mano */\nH.TEX_DATOS = " + json.dumps(d, indent=0) + ";\n")
print(len(d), 'texturas')
