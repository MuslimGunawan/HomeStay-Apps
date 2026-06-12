# Panduan Deployment Yuri-HomeStay di InfinityFree

InfinityFree adalah layanan web hosting gratis (shared hosting) berbasis Apache, PHP, dan MySQL. Karena ini adalah shared hosting, ia memiliki beberapa batasan khusus (tidak ada akses terminal SSH, tidak bisa menjalankan command composer/npm, folder publik web root bernama `htdocs` bukan `public`).

Ikuti panduan berikut langkah demi langkah agar aplikasi Anda terpasang secara sempurna dan aman.

---

## 1. Persiapan File Lokal (Lakukan Sebelum Upload)

Sebelum mengunggah file ke FTP InfinityFree, Anda harus meng-compile file asset frontend Anda secara lokal.

1. Buka terminal proyek Anda secara lokal.
2. Jalankan perintah kompilasi frontend:
   ```bash
   npm run build
   ```
   *Langkah ini akan menghasilkan folder kompilasi `public/build/` yang berisi file CSS, JS, dan asset-asset lain.*

---

## 2. Struktur Direktori FTP (Penting demi Keamanan!)

Jangan mengunggah seluruh proyek Laravel Anda langsung ke dalam folder `htdocs`. Hal ini dapat mengekspos file konfigurasi rahasia Anda (seperti `.env`) ke publik. Ikuti teknik struktur folder yang aman di bawah ini:

### Struktur Target di File Manager FTP Anda:
```
/ (Akar Akun FTP Anda)
├── .env (File konfigurasi Laravel Anda)
├── app/
├── bootstrap/
├── config/
├── database/
├── routes/
├── vendor/
├── ... (Semua folder & file inti Laravel lainnya)
│
└── htdocs/ (Folder web root publik bawaan dari InfinityFree)
    ├── build/ (Dipindahkan dari folder public/build/)
    ├── images/ (Dipindahkan dari folder public/images/)
    ├── .htaccess (Dipindahkan dari folder public/.htaccess)
    ├── favicon.ico (Dipindahkan dari folder public/favicon.ico)
    ├── index.php (Dipindahkan dari folder public/index.php)
    └── robots.txt (Dipindahkan dari folder public/robots.txt)
```

### Langkah Upload:
1. Masuk ke FTP akun InfinityFree Anda menggunakan Client FTP seperti **FileZilla** (Direkomendasikan) atau File Manager bawaan di Control Panel.
2. Unggah **semua folder dan file** proyek Laravel Anda (termasuk folder `vendor` yang telah di-install secara lokal) ke folder akar `/` (sejajar dengan folder `htdocs`).
3. Buka folder `public/` di lokal Anda, lalu unggah seluruh isinya (termasuk subfolder `build`, `images`, file `index.php`, `.htaccess`, dsb.) **langsung ke dalam folder `htdocs/`** pada FTP.
4. Folder `public/` kosong di direktori akar FTP bisa Anda biarkan saja atau dihapus.

---

## 3. Penyesuaian File `htdocs/index.php`

Karena Anda memindahkan file `index.php` ke folder `htdocs/` dan folder core Laravel (seperti `vendor/` dan `bootstrap/`) berada sejajar di folder luar (`../`), Anda **tidak perlu mengubah jalur/path file index.php**!

Jalur default di `htdocs/index.php` akan tetap mendeteksi folder di tingkat atas dengan benar:
```php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
```

---

## 4. Konfigurasi Database & Environment (`.env`)

Buat file baru bernama `.env` di direktori akar FTP Anda (sejajar dengan `htdocs`), lalu isi dengan konfigurasi berikut (sesuaikan dengan informasi database MySQL dari control panel InfinityFree Anda):

```ini
APP_NAME="Yuri-HomeStay"
APP_ENV=production
APP_KEY=base64:14AAJvq/DhSgD2OwZqg2Ne+CZm1XIc3nEOtJEWnyMgo=
APP_DEBUG=false
APP_URL=https://domain-anda-di-infinityfree.infinityfreeapp.com

DB_CONNECTION=mysql
DB_HOST=sqlXXX.epizy.com       # Ganti dengan Database Host dari Panel InfinityFree Anda
DB_PORT=3306
DB_DATABASE=epiz_XXXX_xxxx     # Ganti dengan Nama Database MySQL Anda
DB_USERNAME=epiz_XXXX_xxxx     # Ganti dengan Username MySQL Anda
DB_PASSWORD=PasswordAnda       # Ganti dengan Password Akun Panel Anda

# Konfigurasi Override Folder Publik Khusus Shared Hosting (Paling Penting!)
PUBLIC_PATH=htdocs

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

> [!IMPORTANT]
> - **`PUBLIC_PATH=htdocs`**: Baris ini memberi tahu Laravel secara dinamis bahwa folder web publik adalah `htdocs` (milik InfinityFree) alih-alih `public` bawaan Laravel. Hal ini menjamin file aset, gambar, dan link yang di-generate via program akan terdeteksi dengan tepat tanpa error path.
> - **`APP_DEBUG=false`**: Selalu pastikan bernilai `false` di server produksi agar tidak membocorkan credential database jika terjadi error runtime.

---

## 5. Menjalankan Migrasi Database

Karena InfinityFree tidak menyediakan Terminal SSH / command-line php, Anda tidak bisa mengetikkan `php artisan migrate` secara langsung di server.

Untuk melakukan migrasi database pertama kali di server InfinityFree, Anda bisa menggunakan salah satu dari metode di bawah ini:

### Metode A: Ekspor/Impor Database lewat phpMyAdmin (Direkomendasikan & Paling Mudah)
1. Ekspor database lokal Anda dari Laragon:
   - Buka `phpMyAdmin` atau aplikasi database management (HeidiSQL/DBeaver) secara lokal.
   - Pilih database `homestay_apps`.
   - Pilih tab **Export** dan unduh file `.sql` database Anda.
2. Impor ke database InfinityFree:
   - Buka Control Panel InfinityFree Anda, cari menu **phpMyAdmin**.
   - Buka database yang sudah dibuat untuk homestay Anda.
   - Pilih tab **Import**, unggah file `.sql` lokal tadi, lalu klik **Go**.

### Metode B: Trigger Migrasi lewat Route Web Sementara
Jika database kosong dan Anda ingin menjalankan migrasi menggunakan server PHP InfinityFree:
1. Buka file `routes/web.php` di FTP Anda.
2. Tambahkan route temporer di baris paling bawah:
   ```php
   Route::get('/run-migration-temp', function() {
       \Illuminate\Support\Facades\Artisan::call('migrate --force');
       return "Database successfully migrated!";
   });
   ```
3. Akses URL `https://domain-anda.infinityfreeapp.com/run-migration-temp` lewat browser Anda.
4. Setelah muncul tulisan sukses, segera hapus kembali route temporer tersebut dari file `routes/web.php` demi keamanan web Anda.

---

## 6. Selesai!

Website Yuri-HomeStay Anda sekarang siap dikunjungi. Pengguna akan secara otomatis disambut oleh banner **Cookie Consent** di awal kunjungan mereka, dan semua aset visual, CSS, JS, serta routing database akan berjalan sempurna di server InfinityFree!
