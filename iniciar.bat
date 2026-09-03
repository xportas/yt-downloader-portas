@echo off
title INICIAR PIRATEADOR
color 06

cd /d "%~dp0"
set "PATH=%PATH%;C:\Program Files\nodejs;%~dp0bin"

cls
echo ======================================================================
echo             PORTAS EL PIRATEADOR - DESCARGADOR DE YOUTUBE
echo ======================================================================
echo.
echo   Iniciando la aplicacion...
echo   Tu navegador web se abrira automaticamente en unos segundos.
echo.

:: Liberar puerto 3000 por si habia una sesion previa abierta
powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force" >nul 2>nul

echo ======================================================================
echo.
echo   * NOTA PARA LOS USUARIOS:
echo   - Puedes MINIMIZAR (NO CERRAR) esta ventana negra.
echo   - Usa la pagina web que se abrira en tu navegador para descargar videos.
echo   - Cuando termines de usar el programa, simplemente cierra esta ventana negra. Se detendrá toda la app y no seguirá corriendo en segundo plano.
echo.
echo ======================================================================
echo.

:: Abrir navegador web en segundo plano tras 3 segundos
start "" /min powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

:: Iniciar el servidor local de Next.js
call npm run start

echo.
echo La aplicacion se ha detenido.
pause
