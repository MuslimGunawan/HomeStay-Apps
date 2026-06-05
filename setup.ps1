# Setup Script for HomeStay-Apps (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "   Memulai Setup Yuri Homestay (HomeStay-Apps)   " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

# Helper to install via winget
function Install-Prerequisite($name, $wingetId) {
    Write-Host "$name tidak ditemukan di PATH." -ForegroundColor Red
    $choice = Read-Host "Apakah Anda ingin menginstal $name secara otomatis menggunakan winget? (Y/N)"
    if ($choice -eq 'Y' -or $choice -eq 'y') {
        Write-Host "Menginstal $name via winget..." -ForegroundColor Yellow
        Start-Process winget -ArgumentList "install --id $wingetId --silent --accept-source-agreements --accept-package-agreements" -Wait -NoNewWindow
        Write-Host "✔ Proses instalasi $name selesai. Catatan: Silakan restart PowerShell Anda jika PATH belum terbarui." -ForegroundColor Green
    } else {
        Write-Host "$name wajib diinstal secara manual untuk melanjutkan." -ForegroundColor Red
        exit 1
    }
}

# 1. Check Prerequisites
Write-Host "`n[1/7] Memeriksa Prasyarat Sistem..." -ForegroundColor Cyan

$hasPhp = Get-Command php -ErrorAction SilentlyContinue
if (-not $hasPhp) {
    Install-Prerequisite "PHP" "PHP.PHP"
    $hasPhp = Get-Command php -ErrorAction SilentlyContinue
    if (-not $hasPhp) {
        Write-Host "Instalasi selesai tetapi PHP belum terbaca di sesi PATH ini. Silakan buka kembali PowerShell." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✔ PHP ditemukan." -ForegroundColor Green
}

$hasComposer = Get-Command composer -ErrorAction SilentlyContinue
if (-not $hasComposer) {
    Install-Prerequisite "Composer" "Composer.Composer"
    $hasComposer = Get-Command composer -ErrorAction SilentlyContinue
    if (-not $hasComposer) {
        Write-Host "Instalasi selesai tetapi Composer belum terbaca di sesi PATH ini. Silakan buka kembali PowerShell." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✔ Composer ditemukan." -ForegroundColor Green
}

$hasNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $hasNode) {
    Install-Prerequisite "Node.js" "OpenJS.NodeJS"
    $hasNode = Get-Command node -ErrorAction SilentlyContinue
    if (-not $hasNode) {
        Write-Host "Instalasi selesai tetapi Node.js belum terbaca di sesi PATH ini. Silakan buka kembali PowerShell." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✔ Node.js ditemukan." -ForegroundColor Green
}

# 2. Composer Install
Write-Host "`n[2/7] Menginstal dependensi PHP via Composer..." -ForegroundColor Cyan
composer install --no-interaction
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal menginstal dependensi Composer."
    exit 1
}

# 3. Copy .env
Write-Host "`n[3/7] Membuat file konfigurasi .env..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✔ File .env dibuat dari .env.example." -ForegroundColor Green
} else {
    Write-Host "✔ File .env sudah ada." -ForegroundColor Yellow
}

# 4. Generate App Key
Write-Host "`n[4/7] Membuat Application Key..." -ForegroundColor Cyan
php artisan key:generate --no-interaction

# 5. Database Setup (SQLite)
Write-Host "`n[5/7] Menyiapkan Database SQLite..." -ForegroundColor Cyan
$dbPath = "database/database.sqlite"
if (-not (Test-Path $dbPath)) {
    New-Item -ItemType File -Path $dbPath -Force | Out-Null
    Write-Host "✔ File database SQLite dibuat." -ForegroundColor Green
} else {
    Write-Host "✔ File database SQLite sudah ada." -ForegroundColor Yellow
}

Write-Host "Menjalankan migrasi dan seeder data..." -ForegroundColor Cyan
php artisan migrate:fresh --seed --force
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal menjalankan migrasi database."
    exit 1
}
Write-Host "✔ Migrasi dan seeder database berhasil dijalankan." -ForegroundColor Green

# 6. NPM Install & Build
Write-Host "`n[6/7] Menginstal dependensi Node.js..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal menginstal dependensi NPM."
    exit 1
}

# 7. Storage Link & Default Logo Setup
Write-Host "`n[7/7] Membuat tautan penyimpanan (storage link) & Logo..." -ForegroundColor Cyan
php artisan storage:link --no-interaction

# Ensure default logo exists in public/images/logo.png
if (-not (Test-Path public/images)) {
    New-Item -ItemType Directory -Path public/images -Force | Out-Null
}
if (-not (Test-Path public/images/logo.png)) {
    if (Test-Path public/apple-touch-icon.png) {
        Copy-Item public/apple-touch-icon.png -Destination public/images/logo.png -Force
    }
}

Write-Host "Kompilasi aset frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal mengompilasi aset frontend."
    exit 1
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "        SETUP SELESAI DENGAN SUKSES!             " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Jalankan './start.ps1' untuk memulai aplikasi." -ForegroundColor Yellow
