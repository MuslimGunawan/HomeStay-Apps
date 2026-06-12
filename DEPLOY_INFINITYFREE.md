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

InfinityFree menerapkan kebijakan keamanan ketat di mana **semua file yang diunggah di luar folder `htdocs` akan dihapus secara otomatis**. Oleh karena itu, seluruh file proyek Laravel Anda (termasuk folder `vendor`, `app`, `config`, `.env`, dll.) **harus diletakkan di dalam folder `htdocs/`**.

Berikut adalah struktur folder yang benar di dalam folder `htdocs` FTP Anda:

```
/ (Akar Akun FTP Anda)
└── htdocs/ (Folder web root bawaan dari InfinityFree)
    ├── .htaccess            <-- File .htaccess Utama (Lihat Bagian 3)
    ├── .env                 <-- File konfigurasi produksi Laravel Anda
    ├── artisan
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── resources/
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── ... (Semua file/folder Laravel lainnya)
    │
    └── public/              <-- Tetap dipertahankan di dalam htdocs
        ├── build/           <-- Folder kompilasi frontend (CSS/JS)
        ├── images/          <-- Folder aset gambar
        ├── .htaccess        <-- File .htaccess bawaan Laravel
        ├── favicon.ico
        ├── index.php
        └── robots.txt
```

### Langkah Upload Menggunakan FileZilla:
1. Jalankan `npm run build` di terminal lokal Anda terlebih dahulu untuk memastikan asset terkompilasi.
2. Hubungkan FileZilla ke akun FTP InfinityFree Anda.
3. Buka folder **`htdocs/`** di panel sebelah kanan (Server FTP).
4. Blok seluruh folder dan file di dalam direktori proyek lokal Anda (termasuk folder `public/`, `vendor/`, dll.), lalu seret semuanya langsung ke dalam folder **`htdocs/`** di panel kanan.
5. Tunggu hingga semua file berhasil ditransfer (tidak boleh ada file yang diletakkan di luar `htdocs`).

---

## 3. File `.htaccess` di Root `htdocs/` (Pengalihan & Keamanan)

Karena seluruh proyek Laravel berada di dalam `htdocs/`, tetapi folder publik yang seharusnya diakses browser adalah `htdocs/public/`, kita harus membuat file **`.htaccess` utama** di dalam root folder `htdocs/` (sejajar dengan `.env` dan folder `app/`).

Buat file baru bernama `.htaccess` di dalam folder `htdocs/` FTP Anda, lalu isi dengan kode berikut:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # 1. Lindungi file & folder sensitif agar tidak bisa diakses langsung via browser
    RedirectMatch 403 /\.(git|env|lock|json|yml|yaml)$
    RedirectMatch 403 ^/(app|bootstrap|config|database|resources|routes|storage|tests|vendor)/

    # 2. Alihkan seluruh lalu lintas web ke folder public/ secara otomatis
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

> [!NOTE]
> File `.htaccess` di atas memastikan ketika pengunjung mengakses `https://domain-anda.com/`, server secara otomatis mengarahkan ke file `public/index.php` tanpa memperlihatkan nama folder `/public` pada URL. Jika pengunjung mencoba mengakses file `.env` atau folder `config/`, mereka akan langsung mendapatkan error **403 Forbidden**.

---

## 4. Konfigurasi Database & Environment (`.env`)

Buat file baru bernama `.env` di dalam folder `htdocs/` FTP Anda, lalu isi dengan konfigurasi berikut (sesuaikan dengan informasi database MySQL dari control panel InfinityFree Anda):

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

# Gunakan public folder default karena struktur folder relatif tetap dipertahankan
PUBLIC_PATH=public

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

> [!IMPORTANT]
> - **`PUBLIC_PATH=public`**: Pada konfigurasi ini, kita menggunakan `public` karena folder `public/` tetap berada di dalam proyek root (`htdocs`). Hal ini memastikan Laravel mengidentifikasi target penyimpanan asset dengan benar.
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
