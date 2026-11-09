@echo off
chcp 65001 >nul
title Crear Acceso Directo en el Escritorio
cd /d "%~dp0"

echo ========================================================
echo    CREANDO ACCESO DIRECTO EN EL ESCRITORIO
echo ========================================================
echo.

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut([System.IO.Path]::Combine($desktop, 'Sistema Contable.lnk')); $s.TargetPath = '%~dp0iniciar_sistema.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Sistema de Gestion Contable y Recibos'; $s.Save()"

if %ERRORLEVEL% equ 0 (
    echo ✅ Acceso directo "Sistema Contable" creado con exito en tu Escritorio!
) else (
    echo ⚠️ No se pudo crear automaticamente el acceso directo.
)

echo.
pause
