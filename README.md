# Yuri Homestay Lhokseumawe (HomeStay-Apps)

HomeStay-Apps adalah platform pemesanan kamar homestay/penginapan berbasis web modern. Aplikasi ini dirancang menggunakan **Laravel 13**, **Inertia.js v3**, **React 19**, **Tailwind CSS v4**, dan **SQLite** untuk memberikan pengalaman Single Page Application (SPA) yang sangat cepat, interaktif, dan berestetika mewah (*glassmorphism & gold accent*).

---

## 🛠️ Stack Teknologi & Fitur Unggulan

- **Backend:** Laravel 13 (PHP 8.3+), Fortify (Authentication).
- **Frontend:** React 19, Inertia.js v3 (dengan XHR built-in client, deferred props, polling), Tailwind CSS v4.
- **Database:** SQLite (Sangat portabel & ringan untuk demo di laptop penguji).
- **Fitur Proteksi Media:** 
  - Penempelan watermark transparan secara otomatis di backend menggunakan GD Library.
  - Penonaktifan klik kanan (`contextmenu`) dan penyeretan (`draggable="false"`) pada galeri foto.
  - Penempelan watermark link sumber otomatis saat menyalin teks deskripsi (*copy source watermark listener*).
- **Auto-Register Tamu:** Akun tamu otomatis terbuat secara instan saat melakukan checkout pemesanan kamar tanpa harus mendaftar manual.
- **Pusat Bantuan Terpadu:** Tombol WhatsApp dinamis langsung ke Host serta formulir tiket support terpusat ke Super Admin.

---

## 📋 Prasyarat Sistem & Tautan Unduh

Sebelum memulai instalasi, pastikan komputer Anda telah terinstal alat-alat berikut:

1. **Git Version Control**
   - Diperlukan untuk melakukan kloning kode sumber.
   - [Unduh Git untuk Windows](https://git-scm.com/downloads)
2. **PHP (Versi >= 8.3)**
   - Bahasa pemrograman backend utama.
   - Sangat disarankan mengunduh **Laragon** (menyediakan PHP, Apache, dan SQLite instan di Windows).
   - [Unduh Laragon](https://laragon.org/download/) atau [Unduh PHP Standalone](https://windows.php.net/download/)
3. **Composer**
   - Dependensi manajer untuk PHP.
   - [Unduh Composer](https://getcomposer.org/download/)
4. **Node.js (Versi >= 18) & NPM**
   - Lingkungan eksekusi untuk mengompilasi aset frontend React.
   - [Unduh Node.js](https://nodejs.org/en/download)

---

## 🚀 Panduan Instalasi Cepat (Otomatis via PowerShell)

Kami menyediakan skrip otomatisasi khusus Windows menggunakan PowerShell untuk memudahkan proses instalasi dari awal hingga siap digunakan.

### Langkah 1: Kloning Repositori
Buka Git Bash atau Command Prompt, lalu jalankan perintah:
```bash
git clone https://github.com/MuslimGunawan/HomeStay-Apps.git
cd HomeStay-Apps
```

### Langkah 2: Jalankan Script Setup
1. Buka **PowerShell** di Windows Anda.
2. Jika PowerShell Anda memblokir pengeksekusian skrip eksternal, jalankan perintah berikut untuk mengizinkannya (hanya berlaku pada sesi PowerShell saat ini):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope Process
   ```
3. Eksekusi skrip setup otomatis:
   ```powershell
   ./setup.ps1
   ```
   *Skrip ini otomatis menginstal dependensi Composer, menyalin file konfigurasi `.env`, membuat database SQLite, menjalankan migrasi & seeder data sampel mewah, menginstal dependensi NPM, membuat link penyimpanan berkas (`storage:link`), serta mengompilasi aset statis frontend.*

### Langkah 3: Jalankan Aplikasi
Setelah setup selesai dengan sukses, jalankan perintah berikut di PowerShell untuk membuka server lokal dan browser Anda secara otomatis:
```powershell
./start.ps1
```
Aplikasi Anda akan segera terbuka dan berjalan di browser Anda pada alamat: **http://localhost:8000**

---

## 🔧 Panduan Instalasi Manual (Langkah-demi-Langkah)

Jika Anda ingin menginstal secara manual tanpa skrip PowerShell, ikuti langkah-langkah berikut setelah melakukan kloning:

1. **Instal Dependensi PHP:**
   ```bash
   composer install
   ```
2. **Buat File Konfigurasi `.env`:**
   ```bash
   copy .env.example .env
   ```
3. **Generate Kunci Aplikasi:**
   ```bash
   php artisan key:generate
   ```
4. **Buat File Database SQLite:**
   Buat file kosong bernama `database.sqlite` di dalam direktori `database/`.
   - Di Windows (CMD): `type NUL > database\database.sqlite`
   - Di PowerShell: `New-Item -ItemType File -Path database/database.sqlite`
   - Di Git Bash / Linux: `touch database/database.sqlite`
5. **Jalankan Migrasi & Seeder Database:**
   ```bash
   php artisan migrate:fresh --seed
   ```
6. **Instal Dependensi Frontend & Compile:**
   ```bash
   npm install
   npm run build
   ```
7. **Hubungkan Symlink Penyimpanan Berkas:**
   ```bash
   php artisan storage:link
   ```
8. **Jalankan Server Lokal:**
   ```bash
   composer run dev
   ```
   Buka peramban Anda dan akses **http://localhost:8000**.

---

## 🔑 Kredensial Login Akun Sampel (Seeded Data)

Untuk memudahkan pengujian fungsionalitas multi-role, database seeder kami telah menyediakan akun-akun berikut dengan password default: `password`

| Peran (Role) | Email | Deskripsi Akses |
| :--- | :--- | :--- |
| **Super Admin** | `admin@homestay.com` | Mengelola metode pembayaran, branding logo, user, amenities global, dan tiket support. |
| **Host (Pemilik)** | `host@homestay.com` | Mengelola kamar (CRUD), persetujuan reservasi, keluhan tamu, & memantau stays. |
| **Guest (Tamu)** | `guest@homestay.com` | Memesan kamar, melihat e-receipt, menyukai wishlist, mengirim keluhan, & menulis review. |

---

## 🎯 Fitur & Alur Kerja Pengguna

1. **Eksplorasi & Reservasi Kamar:** Tamu memilih tanggal masuk/keluar di kalender, mengisi form pesanan (nama, nomor WA, email, bank transfer), lalu menekan tombol pesan.
2. **Auto-Register & Auto-Login:** Sistem otomatis mendaftarkan akun tamu tersebut, menghasilkan password sementara yang aman, mengautentikasikannya, serta menampilkan struk pemesanan beserta password sementara.
3. **Unggah Bukti Transfer:** Tamu mentransfer secara manual ke rekening bank/QRIS milik Yuri Homestay dan mengunggah bukti bayarnya.
4. **Persetujuan Host:** Pemilik homestay (Host) atau Admin memverifikasi bukti transfer dan menyetujui reservasi agar berstatus `confirmed` (terkonfirmasi).
5. **Pemantauan Kamar & Komunikasi:** Tamu yang sedang menginap dapat mengirim keluhan/aduan langsung dari dasbor tamu ke pemilik homestay. Tamu juga dapat menghubungi WhatsApp Host melalui tombol dinamis yang disediakan.
6. **Sistem Ulasan (Review):** Setelah waktu tinggal selesai, tamu dapat memberikan nilai rating (1-5 bintang) dan komentar ulasan yang akan tampil secara publik di halaman detail kamar dan landing page.
