import sys, json
from playwright.sync_api import sync_playwright
url = sys.argv[1]; out = sys.argv[2]; espera = int(sys.argv[3]) if len(sys.argv) > 3 else 4000
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.goto(url); pg.wait_for_timeout(espera)
    pg.screenshot(path=out)
    print(json.dumps(pg.evaluate("({estado:H.estado,t:H.juego.t,buques:H.juego.buques.map(b=>[b.nombre,Math.round(b.hp),Math.round(b.pos.x),Math.round(b.pos.z),b.vivo]),p:H.puntaje,fps:Math.round(H.fps),fin:H.juego.fin&&H.juego.fin.titulo, stats:H.stats})"), ensure_ascii=False))
    print(errs[:12])
    b.close()
