@echo off
chcp 65001 >nul
title FarmaCompare — Crear instalador .exe
color 0A

echo.
echo  =============================================
echo    💊  Creando instalador FarmaCompare.exe
echo  =============================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js no encontrado. Instálalo desde https://nodejs.org
    pause & exit /b 1
)

:: Instalar dependencias del backend
echo  📦 Preparando backend...
cd /d "%~dp0..\backend"
call npm install --silent
if %errorlevel% neq 0 ( echo ❌ Error en backend & pause & exit /b 1 )

:: Instalar dependencias del frontend y compilar
echo  📦 Compilando interfaz web...
cd /d "%~dp0..\frontend"
call npm install --silent
call npm run build
if %errorlevel% neq 0 ( echo ❌ Error compilando frontend & pause & exit /b 1 )

:: Crear el instalador con electron-builder
echo  🔨 Creando instalador Windows (.exe)...
cd /d "%~dp0"
call npm install --silent
call npm run build:win
if %errorlevel% neq 0 ( echo ❌ Error creando instalador & pause & exit /b 1 )

echo.
echo  =============================================
echo   ✅ ¡Instalador creado exitosamente!
echo.
echo   Busca el archivo en:
echo   electron\dist-electron\
echo   Se llama: FarmaCompare Chile Setup X.X.X.exe
echo  =============================================
echo.
explorer "%~dp0dist-electron"
pause
