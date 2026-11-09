@echo off
chcp 65001 >nul
title Instalador Inicial del Sistema Contable
cd /d "%~dp0"

echo ========================================================
echo   INSTALACIÓN Y CONFIGURACIÓN INICIAL DEL SISTEMA
echo ========================================================
echo.
echo Este asistente instalará las dependencias y compilará
echo el sistema para dejarlo listo en esta computadora.
echo.
pause

echo.
echo [1/4] Instalando dependencias de Node.js...
call npm install
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..

echo.
echo [2/4] Compilando la interfaz Frontend...
cd frontend && call npm run build && cd ..

echo.
echo [3/4] Compilando el servidor Backend...
cd backend && call npm run build && cd ..

echo.
echo [4/4] Creando acceso directo en el Escritorio...
call "%~dp0crear_acceso_directo.bat"

echo.
echo ========================================================
echo  ✅ ¡INSTALACIÓN COMPLETADA CON ÉXITO!
echo  Ya puedes abrir el sistema desde el acceso directo
echo  "Sistema Contable" en tu Escritorio.
echo ========================================================
echo.
pause
