@echo off
chcp 65001 >nul
title Respaldar Base de Datos Contable
cd /d "%~dp0"

echo ========================================================
echo        RESPALDO DE BASE DE DATOS CONTABLE
echo ========================================================
echo.

if not exist backups mkdir backups

:: Obtener fecha y hora en formato YYYY-MM-DD_HHMM
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set FECHA=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%

set ARCHIVO=backups\respaldo_contaduria_%FECHA%.sql

echo Creando copia en: %ARCHIVO%...

set PGPASSWORD=1234
pg_dump -U postgres -h localhost -d contaduria -F p -f "%ARCHIVO%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  ✅ RESPALDO COMPLETADO EXITOSAMENTE!
    echo  Archivo: %ARCHIVO%
    echo ========================================================
) else (
    echo.
    echo ⚠️ Hubo un error al generar la copia. 
    echo Verifique que PostgreSQL este en ejecucion o que la contrasena sea la correcta.
)

echo.
pause
