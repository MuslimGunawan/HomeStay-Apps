@echo off
title Yuri Homestay - Start Server
cd /d "%~dp0"
echo Memulai aplikasi...
powershell -NoProfile -ExecutionPolicy Bypass -File .\start.ps1
pause
