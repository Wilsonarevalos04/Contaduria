@echo off
chcp 65001 >nul
title Sistema de Gestión Contable y Recibos
cd /d "%~dp0"

echo ========================================================
echo        SISTEMA DE GESTIÓN CONTABLE Y RECIBOS
echo ========================================================
echo.
echo [1/2] Conectando base de datos y preparando entorno...
echo [2/2] Abriendo sistema en modo aplicación...
echo.

:: Espera 2 segundos y abre Edge o Chrome en modo ventana de escritorio limpia
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; try { Start-Process 'msedge' '--app=http://localhost:4000' } catch { try { Start-Process 'chrome' '--app=http://localhost:4000' } catch { Start-Process 'http://localhost:4000' } }"

:: Iniciar el servidor
cd backend
node dist/server.js
pause
