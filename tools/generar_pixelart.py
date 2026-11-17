# Genera el arte pixel art base del juego (PNG + JPG). Autor: Elio Gabancho. Retocar luego en Pyxel Edit.
from PIL import Image, ImageDraw, ImageFont
import random, os, glob
random.seed(1879)
OUT='assets/pixelart/png/'
def save(im,name): im.save(OUT+name+'.png')
def noise_tex(base, var, n=32, seed=0):
    r=random.Random(seed); im=Image.new('RGBA',(n,n))
    for y in range(n):
        for x in range(n):
            d=r.choice(var); im.putpixel((x,y),tuple(max(0,min(255,c+d)) for c in base)+(255,))
    return im
# --- Hierro (casco negro con planchas y remaches)
im=noise_tex((38,40,46),[-4,0,0,3],seed=1); d=ImageDraw.Draw(im)
for y in (0,16): d.line([(0,y),(31,y)],fill=(22,23,27,255))
for y,off in ((0,0),(16,8)):
    for x in range(off,32,16): d.line([(x,y),(x,y+15)],fill=(22,23,27,255))
for y in (3,13,19,29):
    for x in range(2,32,4): im.putpixel((x,y),(70,74,82,255))
save(im,'tex_hierro')
# --- Obra muerta clara
im=noise_tex((196,196,186),[-6,0,0,4],seed=2); d=ImageDraw.Draw(im)
for y in (0,16): d.line([(0,y),(31,y)],fill=(150,150,142,255))
for x in range(4,32,8): im.putpixel((x,8),(120,120,112,255)); im.putpixel((x,24),(120,120,112,255))
save(im,'tex_hierro_claro')
# --- Casco de madera
im=noise_tex((62,40,26),[-6,-2,0,4],seed=3); d=ImageDraw.Draw(im)
for y in range(0,32,4): d.line([(0,y),(31,y)],fill=(36,22,14,255))
for y in range(0,32,8):
    for x in range((y*3)%16,32,16): d.line([(x,y),(x,y+3)],fill=(36,22,14,255))
d.rectangle([0,20,31,23],fill=(214,206,180,255))
for x in range(4,32,8): d.rectangle([x,21,x+2,22],fill=(20,14,10,255))
save(im,'tex_madera_casco')
# --- Cubierta de tablones
im=noise_tex((150,112,70),[-8,-3,0,5],seed=4); d=ImageDraw.Draw(im)
for x in range(0,32,4): d.line([(x,0),(x,31)],fill=(98,70,42,255))
for x in range(0,32,8):
    yy=(x*5)%32; d.line([(x,yy),(x+3,yy)],fill=(98,70,42,255))
save(im,'tex_cubierta')
# --- Vela
im=noise_tex((226,216,188),[-6,0,0,4],seed=5); d=ImageDraw.Draw(im)
for x in range(0,32,8): d.line([(x,0),(x,31)],fill=(190,178,148,255))
for y in (10,21): 
    for x in range(2,32,4): im.putpixel((x,y),(150,138,110,255))
save(im,'tex_vela')
# --- Agua
im=noise_tex((24,84,122),[-5,0,0,4],seed=6); d=ImageDraw.Draw(im)
r=random.Random(7)
for _ in range(14):
    x=r.randrange(32); y=r.randrange(32); L=r.choice([3,4,5])
    for i in range(L): im.putpixel(((x+i)%32,y),(70,140,176,255))
    im.putpixel(((x+1)%32,(y+1)%32),(14,62,96,255))
save(im,'tex_agua')
# --- Costa (roca desértica) y arena
im=noise_tex((176,134,84),[-14,-6,0,8],seed=8); d=ImageDraw.Draw(im)
r=random.Random(9)
for _ in range(10):
    x=r.randrange(30); y=r.randrange(30); d.line([(x,y),(x+r.randrange(2,6),y+r.randrange(0,3))],fill=(120,86,52,255))
for y in (9,22): d.line([(0,y),(31,y)],fill=(150,110,66,255))
save(im,'tex_costa')
save(noise_tex((222,196,140),[-8,-3,0,5],seed=10),'tex_arena')
# --- Casitas de Iquique 64x32
im=Image.new('RGBA',(64,32),(0,0,0,0)); d=ImageDraw.Draw(im)
cols=[(214,198,160),(196,150,110),(226,222,206),(170,188,196),(206,176,120)]
x=1
for i,w in enumerate((11,9,13,10,12)):
    h=(12,16,10,14,11)[i]; c=cols[i]
    d.rectangle([x,31-h,x+w,31],fill=c+(255,)); d.rectangle([x-1,31-h-2,x+w+1,31-h],fill=(120,60,40,255))
    d.rectangle([x+2,31-h+3,x+4,31-h+6],fill=(40,50,70,255))
    if w>10: d.rectangle([x+w-4,31-h+3,x+w-2,31-h+6],fill=(40,50,70,255))
    d.rectangle([x+w//2-1,26,x+w//2+1,31],fill=(80,50,30,255)); x+=w+2
d.rectangle([28,2,30,8],fill=(120,120,120,255)); d.rectangle([27,0,31,2],fill=(170,170,170,255))  # torre iglesia
save(im,'casas_iquique')
# --- Faro 16x48
im=Image.new('RGBA',(16,48),(0,0,0,0)); d=ImageDraw.Draw(im)
for y in range(10,48):
    w=3+(y-10)//12; c=(230,230,224) if (y//8)%2 else (190,40,40)
    d.line([(8-w,y),(7+w,y)],fill=c+(255,))
d.rectangle([4,4,11,9],fill=(255,226,120,255)); d.rectangle([3,2,12,3],fill=(60,60,70,255)); d.rectangle([3,9,12,10],fill=(60,60,70,255))
save(im,'faro')
# --- Banderas 24x16
im=Image.new('RGBA',(24,16)); d=ImageDraw.Draw(im)
d.rectangle([0,0,7,15],fill=(200,30,36,255)); d.rectangle([8,0,15,15],fill=(244,244,238,255)); d.rectangle([16,0,23,15],fill=(200,30,36,255))
d.rectangle([10,6,13,9],fill=(196,160,60,255)); d.point([(11,7),(12,8)],fill=(60,120,70,255))
save(im,'bandera_peru')
im=Image.new('RGBA',(24,16)); d=ImageDraw.Draw(im)
d.rectangle([0,0,23,7],fill=(244,244,238,255)); d.rectangle([0,8,23,15],fill=(206,36,40,255)); d.rectangle([0,0,7,7],fill=(24,52,140,255))
for p in [(3,2),(4,2),(2,3),(3,3),(4,3),(5,3),(3,4),(4,4),(2,5),(5,5)]: im.putpixel(p,(250,250,250,255))
save(im,'bandera_chile')
# --- Retratos 48x48
def retrato(name,bg,skin,hair,barba,calvo,canas=False,bigote=True):
    im=Image.new('RGBA',(48,48),bg+(255,)); d=ImageDraw.Draw(im)
    d.rectangle([0,0,47,47],outline=(196,160,60,255)); d.rectangle([1,1,46,46],outline=(90,70,24,255))
    navy=(22,30,58); gold=(214,176,66); sh=tuple(max(0,c-34) for c in skin)
    d.rectangle([8,36,39,46],fill=navy+(255,)); d.polygon([(8,36),(14,32),(33,32),(39,36)],fill=navy+(255,))
    d.rectangle([5,35,13,38],fill=gold+(255,)); d.rectangle([34,35,42,38],fill=gold+(255,))
    for x in (6,8,10,12,35,37,39,41): d.line([(x,39),(x,41)],fill=gold+(255,))
    for y in (37,40,43): d.rectangle([23,y,24,y+1],fill=gold+(255,))
    d.polygon([(19,32),(28,32),(26,37),(21,37)],fill=(236,236,230,255))
    d.rectangle([20,28,27,33],fill=sh+(255,))
    d.rectangle([15,10,32,29],fill=skin+(255,)); d.rectangle([16,8,31,10],fill=skin+(255,)); d.rectangle([17,29,30,31],fill=skin+(255,))
    d.rectangle([13,17,15,22],fill=skin+(255,)); d.rectangle([32,17,34,22],fill=skin+(255,))
    hc=(150,150,150) if canas else hair
    if calvo:
        d.rectangle([14,11,16,18],fill=hc+(255,)); d.rectangle([31,11,33,18],fill=hc+(255,)); d.rectangle([16,7,19,9],fill=hc+(255,)); d.rectangle([28,7,31,9],fill=hc+(255,))
    else:
        d.rectangle([14,6,33,11],fill=hc+(255,)); d.rectangle([14,11,16,17],fill=hc+(255,)); d.rectangle([31,11,33,17],fill=hc+(255,)); d.rectangle([17,5,30,6],fill=hc+(255,))
    d.rectangle([18,15,21,15],fill=hair+(255,)); d.rectangle([26,15,29,15],fill=hair+(255,))
    d.rectangle([19,17,20,18],fill=(250,250,250,255)); d.rectangle([27,17,28,18],fill=(250,250,250,255))
    im.putpixel((20,18),(20,20,30,255)); im.putpixel((27,18),(20,20,30,255))
    d.rectangle([23,18,24,23],fill=sh+(255,)); d.rectangle([21,26,26,26],fill=(140,70,60,255))
    if bigote: d.rectangle([19,24,28,25],fill=hc+(255,))
    if barba=='patillas':   # patillas largas tipo Grau
        d.rectangle([14,18,17,29],fill=hc+(255,)); d.rectangle([30,18,33,29],fill=hc+(255,)); d.rectangle([16,27,19,31],fill=hc+(255,)); d.rectangle([28,27,31,31],fill=hc+(255,))
    elif barba=='completa':
        d.rectangle([14,19,16,28],fill=hc+(255,)); d.rectangle([31,19,33,28],fill=hc+(255,)); d.rectangle([16,27,31,33],fill=hc+(255,)); d.rectangle([18,33,29,35],fill=hc+(255,)); d.rectangle([21,26,26,26],fill=(140,70,60,255))
    elif barba=='perilla':
        d.rectangle([21,28,26,32],fill=hc+(255,))
    save(im,'retrato_'+name)
retrato('grau',(40,70,96),(214,170,130),(40,30,24),'patillas',True)
retrato('more',(40,70,96),(206,160,124),(60,44,30),'completa',False)
retrato('garcia',(40,70,96),(220,178,140),(30,24,20),'perilla',False)
retrato('prat',(96,48,44),(226,186,150),(36,28,22),'completa',True)
retrato('condell',(96,48,44),(220,180,144),(70,50,30),'perilla',False)
retrato('latorre',(96,48,44),(214,172,134),(40,30,24),'completa',False)
retrato('riveros',(96,48,44),(216,176,140),(120,120,120),'completa',True,canas=True)
# --- Salpicadura 16x32 x6
im=Image.new('RGBA',(96,32),(0,0,0,0)); d=ImageDraw.Draw(im); r=random.Random(11)
for f in range(6):
    ox=f*16; h=[10,20,28,26,16,6][f]; w=[2,3,4,5,6,7][f]; a=[255,255,255,230,180,110][f]
    for y in range(31,31-h,-1):
        t=(31-y)/max(1,h); ww=max(1,int(w*(1-t*0.7)))
        for x in range(8-ww,8+ww):
            if r.random()<0.85: im.putpixel((ox+x,y),((236,246,255,a) if r.random()<0.6 else (150,200,236,a)))
    for _ in range(4+f*2):
        x=ox+r.randrange(2,14); y=31-r.randrange(0,h+3)
        if 0<=y<32: im.putpixel((x,y),(255,255,255,a))
save(im,'salpicadura_16x32_x6')
# --- Humo 16x16 x6
im=Image.new('RGBA',(96,16),(0,0,0,0)); r=random.Random(12)
for f in range(6):
    ox=f*16; rad=[3,4,5,6,7,7][f]; a=[230,210,180,140,100,60][f]; g=[70,84,98,112,126,140][f]
    for y in range(16):
        for x in range(16):
            dd=((x-7.5)**2+(y-7.5)**2)**.5
            if dd<rad and r.random()<(0.95 if dd<rad-1.5 else 0.55):
                v=g+r.choice([-12,0,10]); im.putpixel((ox+x,y),(v,v,v+4,a))
save(im,'humo_16x16_x6')
# --- Íconos 16x16
def icon(name,rows,pal):
    im=Image.new('RGBA',(16,16),(0,0,0,0))
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            if ch in pal: im.putpixel((x,y),pal[ch])
    save(im,'icono_'+name)
P={'#':(30,34,44,255),'o':(214,176,66,255),'w':(236,236,230,255),'r':(200,40,40,255),'g':(120,128,140,255),'b':(60,140,220,255)}
icon('casco',["................","................","......#.........","......#.........",".....###..r.....",".....#w#..#.....","..#########.....",".###############",".#gggggggggggg#.","..#gggggggggg#..","...##########...","..b..b..b..b..b.",".b..b..b..b..b..","................","................","................"],P)
icon('ancla',["................",".......oo.......","......o..o......",".......oo.......",".......oo.......","....oooooooo....",".......oo.......",".......oo.......",".......oo.......",".o.....oo.....o.",".oo....oo....oo.","..oo...oo...oo..","...oooooooooo...",".....oooooo.....","................","................"],P)
icon('canon',["................","................","................","..........####..",".#############..",".#gggggggggggg#.",".#############..","....####..####..","...#oooo#.......","..#oo##oo#......","..#o#..#o#......","..#oo##oo#......","...#oooo#.......","....####........","................","................"],P)
icon('espolon',["................","................","........#.......",".......#g#......","......#ggg#.....",".....#ggggg#....","....#ggggggg#...","...#ggggggggg#..","..#gggwwwwwggg#.",".######www######","......#www#.....","......#www#.....",".......#w#......","........#.......","................","................"],P)
icon('microfono',["................","......####......",".....#gggg#.....",".....#gwgg#.....",".....#gggg#.....",".....#gwgg#.....",".....#gggg#.....","...#.#gggg#.#...","...#..####..#...","...#........#...","....#......#....",".....######.....",".......##.......",".......##.......",".....######.....","................"],P)
icon('boya',["................",".......rr.......",".......rr.......","......rrrr......","......rwwr......",".....rrrrrr.....",".....rwwwwr.....","....rrrrrrrr....","....rwwwwwwr....","...rrrrrrrrrr...","..bbbbbbbbbbbb..",".b..b..b..b..b..","................","................","................","................"],P)
# --- Logo 256x64
im=Image.new('RGBA',(256,64),(0,0,0,0)); d=ImageDraw.Draw(im)
f=ImageFont.truetype('tools/ps2p.ttf',24); f2=ImageFont.truetype('tools/ps2p.ttf',8)
t='HUÁSCAR 3D'; w=d.textlength(t,font=f); x=(256-w)//2
for dx,dy,c in ((3,3,(20,24,40)),(2,2,(120,60,20)),(0,0,(255,206,84))): d.text((x+dx,8+dy),t,font=f,fill=c+(255,))
px=im.load()
for yy in range(8,22):
    for xx in range(256):
        if px[xx,yy][:3]==(255,206,84): px[xx,yy]=(255,238,160,255)
t2='GUERRA DEL PACIFICO 1879'; w2=d.textlength(t2,font=f2); d.text(((256-w2)//2,44),t2,font=f2,fill=(200,220,240,255))
for xx in range(8,248,8): d.line([(xx,58),(xx+3,56),(xx+6,58)],fill=(70,140,196,255))
save(im,'logo_huascar3d')
# --- JPG (fondo sólido) + hoja de sprites ampliada
os.makedirs('assets/pixelart/jpg',exist_ok=True)
files=sorted(glob.glob(OUT+'*.png'))
for p in files:
    im=Image.open(p).convert('RGBA'); s=max(1,min(8,256//max(im.size)))
    big=im.resize((im.width*s,im.height*s),Image.NEAREST); bg=Image.new('RGB',big.size,(27,42,58)); bg.paste(big,mask=big.split()[3])
    bg.save('assets/pixelart/jpg/'+os.path.basename(p)[:-4]+'.jpg',quality=95)
sheet=Image.new('RGB',(1200,1300),(27,42,58)); x=y=10; rowh=0; d=ImageDraw.Draw(sheet)
for p in files:
    im=Image.open(p).convert('RGBA'); s=max(1,min(4,200//max(im.size))) if max(im.size)<200 else 1
    big=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+big.width>1190: x=10; y+=rowh+24; rowh=0
    sheet.paste(big,(x,y),big); d.text((x,y+big.height+2),os.path.basename(p)[:-4][:big.width//6+6],font=ImageFont.truetype('tools/ps2p.ttf',6),fill=(200,220,240))
    x+=max(big.width,90)+12; rowh=max(rowh,big.height)
sheet.crop((0,0,1200,min(1300,y+rowh+30))).save('entregables/capturas_pixelart/hoja_de_sprites.png')
print(len(files),'png')
