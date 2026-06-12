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

Jangan mengunggah seluruh proyek Laravel Anda langsung ke dalam folder `htdocs`. Hal ini dapat mengekspos file konfigurasi rahasia Anda (seperti `.env`) ke publik. Kita harus memisahkan folder publik (`public/`) dengan folder kode inti Laravel Anda demi keamanan.

### Perbandingan Struktur Folder (Lokal vs Server FTP)

#### 📂 DI KOMPUTER LOKAL ANDA (Laragon):
```
c:\laragon\www\HomeStay-Apps\
├── app/
├── bootstrap/
├── config/
├── database/
├── resources/
├── routes/
├── storage/
├── vendor/
├── ... (file lainnya)
│
└── public/  <-- (HANYA ISI FOLDER INI YANG DIUNGGAH KE HTDOCS)
    ├── build/
    ├── images/
    ├── .htaccess
    ├── favicon.ico
    ├── index.php
    └── robots.txt
```

#### 🌐 DI SERVER FTP INFINITYFREE (Target Akhir):
```
/ (Akar Akun FTP Anda)
├── app/                  <-- Diunggah dari luar folder public lokal
├── bootstrap/            <-- Diunggah dari luar folder public lokal
├── config/               <-- Diunggah dari luar folder public lokal
├── database/             <-- Diunggah dari luar folder public lokal
├── resources/            <-- Diunggah dari luar folder public lokal
├── routes/               <-- Diunggah dari luar folder public lokal
├── storage/              <-- Diunggah dari luar folder public lokal
├── vendor/               <-- Diunggah dari luar folder public lokal
├── artisan               <-- Diunggah dari luar folder public lokal
├── .env                  <-- Buat baru langsung di FTP (konfigurasi produksi)
│
└── htdocs/               <-- (Folder bawaan dari InfinityFree)
    ├── build/            <-- Diunggah dari DALAM folder public/ lokal
    ├── images/           <-- Diunggah dari DALAM folder public/ lokal
    ├── .htaccess         <-- Diunggah dari DALAM folder public/ lokal
    ├── favicon.ico       <-- Diunggah dari DALAM folder public/ lokal
    ├── index.php         <-- Diunggah dari DALAM folder public/ lokal
    └── robots.txt        <-- Diunggah dari DALAM folder public/ lokal
```

### Langkah Praktis Pengunggahan via FileZilla:
1. **Unggah Folder Inti (Luar `htdocs`):**
   - Di panel kanan (Server FTP), pastikan Anda berada di direktori akar `/` (sejajar dengan folder `htdocs`).
   - Di panel kiri (Komputer Lokal), blok semua file dan folder proyek Anda **KECUALI folder `public`**.
   - Seret (drag & drop) semuanya ke panel kanan untuk mulai mengunggah.
2. **Unggah File Publik (Ke dalam `htdocs`):**
   - Di panel kiri (Komputer Lokal), **masuklah ke dalam folder `public/`**.
   - Di panel kanan (Server FTP), **masuklah ke dalam folder `htdocs/`**.
   - Blok seluruh isi di dalam folder `public/` lokal Anda, lalu seret ke panel kanan (ke dalam `htdocs/`).

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
1. **Gunakan File SQL yang Sudah Siap Pakai:**
   - Di root folder proyek Anda, sudah tersedia file **[database.sql](file:///c:/laragon/www/HomeStay-Apps/database.sql)**.
   - File ini telah diekspor menggunakan encoding **UTF-8** standar dan dinonaktifkan opsi **GTID**-nya agar tidak menimbulkan error hak akses saat diimpor ke InfinityFree.
2. **Impor ke Database InfinityFree:**
   - Masuk ke akun InfinityFree Anda, cari menu **MySQL Databases**, lalu buat database baru.
   - Klik tombol **Admin** pada database tersebut untuk masuk ke **phpMyAdmin** produksi Anda.
   - Buka database baru tersebut di panel sebelah kiri.
   - Pilih tab/menu **Import** di bagian atas, pilih file **[database.sql](file:///c:/laragon/www/HomeStay-Apps/database.sql)** dari proyek lokal Anda, lalu klik **Import** atau **Go**.

### Metode B: Trigger Migrasi lewat Route Web Sementara
Jika database kosong dan Anda ingin menjalankan migrasi bersih menggunakan server PHP InfinityFree:
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
