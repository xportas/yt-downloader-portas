@echo off
setlocal enabledelayedexpansion
title INSTALAR PORTAS EL PIRATEADOR
color 0B

echo ======================================================================
echo          PORTAS EL PIRATEADOR - INSTALADOR AUTOMATICO
echo ======================================================================
echo.
echo   Bienvenido/a. Este instalador configurara todo de forma automatica
echo   en tu equipo para que puedas descargar videos de YouTube.
echo.
echo ======================================================================
echo.

set "APP_DIR=%LOCALAPPDATA%\PortasElPirateador"
set "REPO_URL=https://github.com/xportas/yt-downloader-portas.git"
set "REPO_ZIP=https://github.com/xportas/yt-downloader-portas/archive/refs/heads/main.zip"

:: 1. COMPROBAR E INSTALAR NODE.JS
echo [Paso 1/5] Verificando instalacion de Node.js...
set "PATH=%PATH%;C:\Program Files\nodejs"
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
        echo [OK] Node.js detectado en Archivos de Programa.
    ) else (
        echo [AVISO] Node.js no esta instalado en este equipo.
        echo [i] Descargando e instalando Node.js oficial automaticamente...
        echo     (Si Windows te pide confirmacion, pulsa 'Si')
        echo.

        set "NODE_MSI=%TEMP%\nodejs_installer.msi"
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi', '%NODE_MSI%')"

        if not exist "%NODE_MSI%" (
            echo [ERROR] No se pudo descargar Node.js. Revisa tu conexion a Internet.
            pause
            exit /b 1
        )

        echo [i] Instalando Node.js de forma silenciosa...
        msiexec /i "%NODE_MSI%" /passive /norestart

        set "PATH=%PATH%;C:\Program Files\nodejs"
        del /f /q "%NODE_MSI%" >nul 2>nul
        echo [OK] Node.js instalado correctamente.
    )
) else (
    echo [OK] Node.js ya esta instalado.
)

echo.
:: 2. DESCARGAR / CLONAR LA APLICACION DESDE GITHUB
echo [Paso 2/5] Descargando la aplicacion desde GitHub...
echo     Carpeta de instalacion: %APP_DIR%
echo.

where git >nul 2>nul
if %errorlevel% equ 0 (
    if exist "%APP_DIR%\.git" (
        echo [i] Actualizando aplicacion existente con git pull...
        cd /d "%APP_DIR%"
        git pull
    ) else (
        echo [i] Clonando repositorio con Git...
        git clone "%REPO_URL%" "%APP_DIR%"
    )
) else (
    echo [i] Git no esta en el sistema. Descargando codigo en ZIP desde GitHub...
    if not exist "%APP_DIR%" mkdir "%APP_DIR%"
    
    set "ZIP_TEMP=%TEMP%\yt_downloader_repo.zip"
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%REPO_ZIP%', '%ZIP_TEMP%')"
    
    if not exist "%ZIP_TEMP%" (
        echo [ERROR] No se pudo descargar el repositorio. Revisa tu conexion.
        pause
        exit /b 1
    )
    
    echo [i] Descomprimiendo archivos en %APP_DIR%...
    powershell -Command "Expand-Archive -Path '%ZIP_TEMP%' -DestinationPath '%TEMP%\yt_extracted' -Force; Copy-Item -Path '%TEMP%\yt_extracted\yt-downloader-portas-main\*' -Destination '%APP_DIR%' -Recurse -Force; Remove-Item -Path '%TEMP%\yt_extracted', '%ZIP_TEMP%' -Recurse -Force"
    echo [OK] Archivos de la aplicacion alojados correctamente.
)

if not exist "%APP_DIR%\package.json" (
    echo [ERROR] No se encontro el proyecto en %APP_DIR%.
    pause
    exit /b 1
)

echo.
:: 3. COMPROBAR MOTORES MULTIMEDIA (yt-dlp y ffmpeg)
echo [Paso 3/5] Verificando motores multimedia (yt-dlp y FFmpeg)...
cd /d "%APP_DIR%"
if not exist "%APP_DIR%\bin" mkdir "%APP_DIR%\bin"

if not exist "%APP_DIR%\bin\yt-dlp.exe" (
    echo [i] Descargando motor de descarga yt-dlp...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', '%APP_DIR%\bin\yt-dlp.exe')"
)
if exist "%APP_DIR%\bin\yt-dlp.exe" (
    echo [OK] Motor yt-dlp listo.
)

if not exist "%APP_DIR%\bin\ffmpeg.exe" (
    echo [i] Descargando motor de conversion FFmpeg...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $zip = '%TEMP%\ffmpeg.zip'; (New-Object Net.WebClient).DownloadFile('https://github.com/GyanD/codexffmpeg/releases/download/7.1/ffmpeg-7.1-essentials_build.zip', $zip); Expand-Archive -Path $zip -DestinationPath '%TEMP%\ffmpeg_unzip' -Force; Copy-Item -Path '%TEMP%\ffmpeg_unzip\*\bin\ffmpeg.exe' -Destination '%APP_DIR%\bin\ffmpeg.exe' -Force; Remove-Item -Path '%TEMP%\ffmpeg_unzip', $zip -Recurse -Force"
)
if exist "%APP_DIR%\bin\ffmpeg.exe" (
    echo [OK] Motor FFmpeg listo.
)

echo.
:: 4. INSTALAR DEPENDENCIAS Y COMPILAR
echo [Paso 4/5] Instalando dependencias y compilando la aplicacion...
echo     (Esto puede tardar un par de minutos la primera vez)
echo.

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo en la instalacion de dependencias.
    pause
    exit /b 1
)

echo [i] Compilando la aplicacion para maxima velocidad...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al compilar la aplicacion.
    pause
    exit /b 1
)

echo.
:: 5. CREAR ACCESO DIRECTO EN EL ESCRITORIO
echo [Paso 5/5] Creando acceso directo en el Escritorio...

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut($desktop + '\INICIAR PIRATEADOR.lnk'); $s.TargetPath = '%APP_DIR%\iniciar.bat'; $s.WorkingDirectory = '%APP_DIR%'; $s.Description = 'Descargador de YouTube Portas El Pirateador'; $s.IconLocation = '%SystemRoot%\System32\shell32.dll,220'; $s.Save()"

echo.
echo ======================================================================
echo                  INSTALACION COMPLETADA CON EXITO
echo ======================================================================
echo.
echo   La aplicacion se ha instalado en tu ordenador en:
echo   %APP_DIR%
echo.
echo   Se ha creado un acceso directo en tu Escritorio llamado:
echo.
echo                   "INICIAR PIRATEADOR"
echo.
echo   Para empezar a usarla, ve a tu Escritorio y haz doble clic
echo   en el icono "INICIAR PIRATEADOR". Ya puedes cerrar esta ventana.
echo.
echo ======================================================================
echo.
pause
