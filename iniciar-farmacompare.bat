@echo off
chcp 65001 >nul
title FarmaCompare — Iniciando...
color 0B

echo.
echo  =========================================
echo    💊  FarmaCompare Chile  💊
echo  =========================================
echo.

:: ── Verificar Node.js ─────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js no está instalado.
    echo.
    echo  Voy a abrir la página de descarga.
    echo  Descarga la versión LTS, instálala y vuelve a ejecutar este archivo.
    echo.
    pause
    start https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  ✅ Node.js encontrado: %NODE_VER%
echo.

:: ── Crear .env si no existe ───────────────────────────────────────────────
set ENV_FILE=%~dp0backend\.env
if not exist "%ENV_FILE%" (
    copy "%~dp0backend\.env.example" "%ENV_FILE%" >nul
)

:: ── Instalar dependencias (solo si faltan) ────────────────────────────────
if not exist "%~dp0backend\node_modules" (
    echo  📦 Instalando dependencias del servidor (solo la primera vez)...
    cd /d "%~dp0backend"
    call npm install --silent
    if %errorlevel% neq 0 (
        echo  ❌ Error instalando dependencias del servidor.
        pause & exit /b 1
    )
    echo  ✅ Servidor listo.
    echo.
)

if not exist "%~dp0frontend\node_modules" (
    echo  📦 Instalando dependencias de la interfaz (solo la primera vez)...
    cd /d "%~dp0frontend"
    call npm install --silent
    if %errorlevel% neq 0 (
        echo  ❌ Error instalando dependencias de la interfaz.
        pause & exit /b 1
    )
    echo  ✅ Interfaz lista.
    echo.
)

:: ── Iniciar backend ───────────────────────────────────────────────────────
echo  🚀 Iniciando servidor...
cd /d "%~dp0backend"
start "FarmaCompare - Servidor" /min cmd /c "npm run dev & pause"

:: Esperar a que el servidor esté listo (máx 15 seg)
echo  ⏳ Esperando que el servidor arranque...
set /a intentos=0
:esperar
timeout /t 2 /nobreak >nul
set /a intentos+=1
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 goto servidor_listo
if %intentos% lss 8 goto esperar
echo  ⚠️  El servidor tardó más de lo esperado, pero intentaremos abrir la app igual.
goto continuar

:servidor_listo
echo  ✅ Servidor corriendo.

:continuar
echo.

:: ── Iniciar frontend ──────────────────────────────────────────────────────
echo  🌐 Iniciando interfaz web...
cd /d "%~dp0frontend"
start "FarmaCompare - Interfaz" /min cmd /c "npm run dev & pause"

:: Esperar a que el frontend esté listo
timeout /t 4 /nobreak >nul

:: ── Abrir en el navegador ─────────────────────────────────────────────────
echo  🔗 Abriendo FarmaCompare en el navegador...
start http://localhost:5173

echo.
echo  =========================================
echo   ✅ FarmaCompare está corriendo en:
echo      http://localhost:5173
echo  =========================================
echo.
echo  Para cerrar la app, cierra esta ventana
echo  y las dos ventanas negras que aparecieron.
echo.
pause
