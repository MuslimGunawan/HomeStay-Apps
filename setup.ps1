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
        Write-Host "[OK] Proses instalasi $name selesai. Catatan: Silakan restart PowerShell Anda jika PATH belum terbarui." -ForegroundColor Green
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
    Write-Host "[OK] PHP ditemukan." -ForegroundColor Green
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
    Write-Host "[OK] Composer ditemukan." -ForegroundColor Green
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
    Write-Host "[OK] Node.js ditemukan." -ForegroundColor Green
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
    Write-Host "[OK] File .env dibuat dari .env.example." -ForegroundColor Green
} else {
    Write-Host "[OK] File .env sudah ada." -ForegroundColor Yellow
}

# 4. Generate App Key
Write-Host "`n[4/7] Membuat Application Key..." -ForegroundColor Cyan
php artisan key:generate --no-interaction

# 5. Database Setup
Write-Host "`n[5/7] Menyiapkan Database..." -ForegroundColor Cyan

# Parse .env to get DB settings
$envContent = Get-Content .env
$dbConnection = "sqlite"
$dbDatabase = "database.sqlite"
$dbHost = "127.0.0.1"
$dbPort = "3306"
$dbUsername = "root"
$dbPassword = ""

foreach ($line in $envContent) {
    if ($line -match "^DB_CONNECTION=(.*)$") { $dbConnection = $Matches[1].Trim() }
    if ($line -match "^DB_DATABASE=(.*)$") { $dbDatabase = $Matches[1].Trim() }
    if ($line -match "^DB_HOST=(.*)$") { $dbHost = $Matches[1].Trim() }
    if ($line -match "^DB_PORT=(.*)$") { $dbPort = $Matches[1].Trim() }
    if ($line -match "^DB_USERNAME=(.*)$") { $dbUsername = $Matches[1].Trim() }
    if ($line -match "^DB_PASSWORD=(.*)$") { $dbPassword = $Matches[1].Trim() }
}

if ($dbConnection -eq "mysql") {
    Write-Host "Menghubungkan ke MySQL (${dbHost}:${dbPort}) untuk memeriksa/membuat database '$dbDatabase'..." -ForegroundColor Cyan
    # Run inline PHP script to create MySQL database
    php -r "
    try {
        `$pdo = new PDO('mysql:host=$dbHost;port=$dbPort', '$dbUsername', '$dbPassword');
        `$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        `$pdo->exec('CREATE DATABASE IF NOT EXISTS $dbDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        echo 'Database MySQL $dbDatabase siap.\n';
    } catch (Exception `$e) {
        echo 'Peringatan: Gagal membuat database MySQL secara otomatis: ' . `$e->getMessage() . '\n';
        echo 'Pastikan server MySQL Anda aktif (misal Laragon/XAMPP) dan buat database $dbDatabase secara manual.\n';
    }
    "
} else {
    Write-Host "Menyiapkan Database SQLite..." -ForegroundColor Cyan
    $dbPath = "database/$dbDatabase"
    if (-not (Test-Path $dbPath)) {
        New-Item -ItemType File -Path $dbPath -Force | Out-Null
        Write-Host "[OK] File database SQLite dibuat." -ForegroundColor Green
    } else {
        Write-Host "[OK] File database SQLite sudah ada." -ForegroundColor Yellow
    }
}

Write-Host "Menjalankan migrasi dan seeder data..." -ForegroundColor Cyan
php artisan migrate:fresh --seed --force
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal menjalankan migrasi database."
    exit 1
}
Write-Host "[OK] Migrasi dan seeder database berhasil dijalankan." -ForegroundColor Green

# 6. NPM Install and Build
Write-Host "`n[6/7] Menginstal dependensi Node.js..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal menginstal dependensi NPM."
    exit 1
}

# 7. Storage Link and Default Logo Setup
Write-Host "`n[7/7] Membuat tautan penyimpanan (storage link) dan Logo..." -ForegroundColor Cyan
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
