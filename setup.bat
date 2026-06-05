@echo off
title Yuri Homestay - Setup Aplikasi
cd /d "%~dp0"
echo Menyiapkan dependensi dan database...
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
pause
