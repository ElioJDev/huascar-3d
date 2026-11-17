@echo off
REM Inicia un servidor local para probar HUASCAR 3D (el microfono y las texturas no funcionan abriendo index.html con doble clic)
echo Abre en Chrome o Edge:  http://localhost:8080
python -m http.server 8080 2>nul || py -m http.server 8080 2>nul || npx --yes serve -l 8080 .
pause
