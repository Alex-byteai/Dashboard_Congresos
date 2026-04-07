@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   SISTEMA DE AUTOMATIZACION IDIC - DASHBOARD
echo ========================================================

:: Change directory to where the script is located
cd /d "%~dp0"

echo.
echo [1/3] Procesando base de datos de CONGRESOS...
python "..\scripts\process_congresos.py"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Falló el procesamiento de Congresos.
)

echo.
echo [2/3] Extrayendo y procesando REVISTAS (Scopus/Excel)...
python "..\scripts\process_revistas.py"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Falló la extracción de Revistas.
)

echo.
echo [3/3] Verificando VENCIMIENTOS y enviando alertas...
python "alert_vencimientos.py"

echo.
echo ========================================================
echo   Proceso de sincronizacion finalizado.
echo ========================================================
pause
