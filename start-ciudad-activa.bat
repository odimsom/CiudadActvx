@echo off
echo Iniciando Ciudad Activa...
echo.

echo 1. Instalando dependencias de la landing...
cd apps\landing
call npm install
echo.

echo 2. Instalando dependencias de la web app...
cd ..\web
call npm install
echo.

echo 3. Iniciando landing page en puerto 4321...
cd ..\landing
start "Landing Page" npm run dev
echo.

echo 4. Esperando 3 segundos...
timeout /t 3 > nul
echo.

echo 5. Iniciando web app en puerto 5173...
cd ..\web
start "Web App" npm run dev
echo.

echo ================================
echo Ciudad Activa iniciado exitosamente!
echo ================================
echo Landing Page: http://localhost:4321
echo Web App: http://localhost:5173
echo ================================
echo.

echo Presiona cualquier tecla para cerrar...
pause > nul
