# Start Script for HomeStay-Apps (Windows PowerShell)
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  Memulai Server Aplikasi Yuri Homestay Lhokseumawe" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Error "File .env tidak ditemukan. Jalankan './setup.ps1' terlebih dahulu."
    exit 1
}

# Inform the user about the URL
Write-Host "`nAplikasi akan berjalan di: http://localhost:8000" -ForegroundColor Green
Write-Host "Membuka browser ke halaman beranda..." -ForegroundColor Cyan
Start-Process "http://localhost:8000"

Write-Host "Memulai Concurrently Server (PHP & Vite Dev Server)..." -ForegroundColor Yellow
Write-Host "Tekan [Ctrl+C] untuk menghentikan server.`n" -ForegroundColor Yellow

# Start the dev process using composer run dev
composer run dev
