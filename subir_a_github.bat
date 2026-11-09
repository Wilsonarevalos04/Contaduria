@echo off
chcp 65001 >nul
title Subir Proyecto a GitHub
cd /d "%~dp0"

echo ========================================================
echo       SUBIENDO REPOSITORIO A GITHUB
echo ========================================================
echo.
echo Repositorio: https://github.com/Wilsonarevalos04/Contaduria.git
echo Rama: main
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  ✅ ¡PROYECTO SUBIDO EXITOSAMENTE A GITHUB!
    echo ========================================================
) else (
    echo.
    echo ⚠️ Si la sesión de GitHub expiró, Git te solicitará
    echo iniciar sesión en el navegador emergente.
)

echo.
pause
