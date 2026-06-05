# Implementation Plan - HomeStay-Apps (Yuri Homestay Aligned)

HomeStay-Apps adalah platform booking penginapan/homestay berbasis web modern. Aplikasi ini dirancang menggunakan **Laravel 13**, **Inertia.js v3**, **React 19**, dan **Tailwind CSS v4** untuk memberikan pengalaman single-page application (SPA) yang sangat cepat, interaktif, dan berestetika tinggi.

## Deskripsi & Konsep Aplikasi

Aplikasi ini akan membagi pengguna menjadi tiga peran utama:
1. **Guest (Tamu):** Mencari homestay, melakukan pemesanan, melihat riwayat pemesanan, dan memberikan ulasan/rating.
2. **Host (Pemilik Homestay):** Mengelola homestay yang disewakan (tambah, edit, hapus foto/fasilitas), serta mengelola pemesanan masuk (menerima/menolak booking).
3. **Admin:** Mengawasi seluruh sistem, memverifikasi akun host, dan mengelola daftar kategori/fasilitas global.

---

## Fitur Utama & Alur Kerja

### 1. Sistem Autentikasi & Profil Ramah Pengguna (Inertia + React)
- **Auto-Register on Checkout (Otomatis):** Pengunjung tidak wajib mendaftar di awal. Akun otomatis terbuat secara instan di latar belakang menggunakan data dari form checkout pembayaran.
- **Login Tradisional:** Tersedia halaman login biasa bagi pengguna yang sudah terdaftar (Guest, Host, Admin).
- **Pengaturan Profil:** Pengguna dapat memperbarui profil mereka (foto, nomor kontak/WhatsApp, alamat, dan **mengubah password** bawaan).

### 2. Eksplorasi & Pencarian Homestay (Guest)
- Halaman beranda dengan desain premium (Hero section menarik, grid homestay terpopuler).
- Fitur pencarian dinamis (berdasarkan kota/lokasi, rentang tanggal, jumlah tamu, rentang harga, dan fasilitas).
- Detail homestay: Galeri foto, deskripsi lengkap, daftar fasilitas (WiFi, AC, Kolam Renang, dsb.), informasi host, ulasan dari tamu lain, dan widget pemesanan interaktif yang langsung mengarah ke Checkout.

### 3. Mesin Pemesanan & Kalender Ketersediaan (Booking Engine)
- Pemilihan tanggal check-in & check-out menggunakan kalender interaktif.
- Pencegahan pemesanan tanggal ganda yang sudah dipesan (date blocking).
- Perhitungan biaya otomatis secara real-time.
- Status pemesanan: `Pending Payment` (Menunggu pembayaran) -> `Pending Approval` (Menunggu persetujuan Host setelah dibayar) -> `Confirmed` (Disetujui) -> `Completed` (Selesai stay) -> `Cancelled` (Dibatalkan).

### 4. Sistem Pembayaran Manual & Auto-Register Seamless
Untuk mempermudah transaksi dan memukau dosen penguji, kita akan menggunakan **Sistem Pembayaran Manual Dinamis Terintegrasi**:
- **Proses Checkout & Pembuatan Akun Otomatis:**
  - Tamu mengisi form pemesanan: Nama Lengkap, Email, Nomor WhatsApp, dan memilih metode pembayaran (BSI, SeaBank, DANA, dsb.).
  - Begitu tombol "Kirim Pemesanan" ditekan, sistem membuat akun `guest` baru menggunakan email tersebut, menghasilkan password sementara yang ramah (misal kombinasi: `Homestay@NoWA`), mengautentikasi (Auto-Login) tamu tersebut secara instan, dan merekam data booking.
- **Penyampaian Password Terbaik (UX Premium):**
  - **Halaman Sukses (E-Receipt):** Tamu langsung diarahkan ke halaman sukses dengan desain mewah yang memunculkan kotak kartu informasi akun baru mereka secara jelas: **Email & Password Sementara** dengan tombol **"Salin Password" (Copy to Clipboard)** dan ikon mata untuk melihat password.
  - **Banner Peringatan di Dasbor:** Karena tamu langsung di-*login*-kan secara otomatis ke dasbor, muncul banner di bagian atas dasbor tamu yang berbunyi: *"Selamat Datang! Akun Anda otomatis aktif. Harap ubah password sementara Anda demi keamanan."* dengan tautan instan ke halaman Edit Profil.
- **Manajemen Metode Pembayaran oleh Admin:**
  - Halaman Admin untuk mengelola metode pembayaran aktif (Nama Bank, Nomor Rekening/HP, Atas Nama, Gambar QRIS).
- **Verifikasi oleh Host:**
  - Host melihat bukti transfer yang diunggah dan menekan `Approve` atau `Reject` pada pemesanan tersebut.

### 5. Fitur Pusat Bantuan & Kontak (Customer Support)
Untuk memastikan tamu dapat menghubungi pihak pengelola homestay dengan mudah, kita akan mengimplementasikan **Pusat Bantuan Multi-Saluran**:
- **Opsi A: Tombol Hubungi via WhatsApp Dinamis (Sangat Praktis & Realistis)**
  - Pada halaman Detail Homestay dan halaman Detail Pemesanan, akan dipasang tombol **"Hubungi Host via WhatsApp"** yang dinamis.
  - Ketika ditekan, tombol ini otomatis membuka WhatsApp Web atau aplikasi WhatsApp dengan pesan pembuka otomatis yang sopan dan terformat rapi (contoh: *"Halo Kak [Nama Host], saya [Nama Guest]. Saya ingin bertanya terkait pesanan Homestay [Nama Homestay]..."*).
- **Opsi B: Help Center & Contact Form (Tiket Dukungan ke Admin)**
  - Halaman Hubungi Kami (Contact Us) publik berupa formulir pesan keluhan/pertanyaan.
  - Setiap pesan yang dikirim oleh tamu (baik terdaftar maupun umum) akan masuk ke **Panel Admin** sebagai "Tiket Support". Admin dapat membaca pesan tersebut dan menandainya sebagai selesai ditangani (*resolved*).

### 6. Dasbor Interaktif (Dashboard Guest & Host)
- **Guest Dashboard:**
  - Melihat riwayat pemesanan & e-receipt.
  - Memberikan rating (1-5 bintang) dan review setelah status pesanan selesai (`Completed`).
  - Halaman Favorit/Wishlist homestay.
- **Host Dashboard:**
  - Ringkasan pendapatan & statistik homestay.
  - CRUD Homestay (Nama, deskripsi, harga per malam, alamat, maps embed, upload foto, toggle fasilitas).
  - Manajemen reservasi: Daftar booking masuk dengan aksi untuk **Setujui (Approve)** atau **Tolak (Reject)**.

---

## Rencana Perubahan & Desain Database

### Tabel Database Utama
1. **`users`**: Kolom default ditambah `role` (`guest`, `host`, `admin`), `phone`, dan `avatar`.
2. **`homestays`**: `user_id` (Host), `name`, `slug`, `description`, `address`, `city`, `price_per_night`, `max_guests`, `latitude`, `longitude`, `status` (active/inactive).
3. **`homestay_media`**: `id`, `homestay_id`, `file_path`, `type` (`image` atau `video`), `category` (khusus area properti luar: `exterior_front`, `garden`, `pool`, `lobby`, `custom`), `is_primary` (Boolean, foto halaman depan).
4. **`room_media`**: `id`, `homestay_id`, `file_path`, `type` (`image` atau `video`), `category` (khusus area kamar/interior dalam: `bedroom_1`, `bedroom_2`, `bathroom`, `living_room`, `kitchen`, `custom`).
5. **`amenities`** & **`amenity_homestay`**: Tabel pivot untuk fasilitas dinamis (WiFi, AC, Kitchen, dsb.).
6. **`payment_methods`**: `id`, `name` (BSI, SeaBank, DANA, GoPay, ShopeePay), `type` (`bank` atau `ewallet`), `account_number` (nomor rekening/HP), `account_name` (atas nama), `qris_image_path` (Gambar QRIS, nullable), `is_active` (Boolean).
7. **`bookings`**: `user_id` (Guest), `homestay_id`, `payment_method_id` (foreign key ke `payment_methods`, nullable), `check_in`, `check_out`, `total_guests`, `total_price`, `payment_receipt_path` (bukti transfer, nullable), `paid_at` (nullable), `status` (`pending_payment`, `pending_approval`, `confirmed`, `completed`, `cancelled`).
8. **`reviews`**: `booking_id`, `user_id`, `homestay_id`, `rating` (Integer 1-5), `comment`.
9. **`support_tickets`**: `id`, `name` (Nama pengirim), `email`, `subject` (Subjek/Topik), `message` (Isi Pesan), `status` (`pending`, `resolved`).
10. **`stay_complaints`**: `id`, `booking_id` (Hubungan dengan transaksi stay aktif), `guest_id` (User Tamu), `homestay_id` (ID Homestay), `message` (Keluhan/Aduan), `status` (`pending`, `resolved`).
11. **`permissions`**: `id`, `name` (Nama izin, misal: `view-revenue`, `edit-homestays`, `delete-homestays`), `slug` (Identifier string).
12. **`permission_user`**: Table pivot menghubungkan `user_id` (Host) dengan `permission_id` untuk mengontrol akses fitur secara dinamis.

### Konfigurasi & Blueprint Database SQLite
Menggunakan **SQLite** adalah keputusan yang sangat cerdas untuk proyek UAS karena SQLite menyimpan seluruh database dalam satu file lokal tunggal (`database/database.sqlite`). Ini membuat aplikasi sangat ringan, portabel, dan langsung siap dijalankan di localhost komputer dosen/penguji tanpa instalasi server MySQL tambahan.
- **Konfigurasi Lokal (`.env`):**
  ```env
  DB_CONNECTION=sqlite
  # DB_DATABASE otomatis mencari database/database.sqlite bawaan Laravel
  ```
- **Catatan Penting Deployment / Hosting:**
  - **Traditional Hosting (cPanel, VPS, Laravel Cloud, Heroku dengan Volume):** Digunakan untuk kebutuhan **Real-Use / Produksi Nyata**. SQLite bekerja dengan sempurna dan sangat stabil karena server memiliki media penyimpanan persisten yang menjaga kelangsungan data pemesanan secara permanen.
  - **Serverless Hosting (Vercel sebagai Platform Preview/Showcase):** 
    - Sesuai rencana Anda, Vercel akan difungsikan khusus sebagai **High-Fidelity Preview Platform** (Demo interaktif). 
    - Database SQLite akan di-*build* bersama aplikasi dan diisi dengan data sampel mewah melalui database seeder (*Seeded Mockup State*). Dosen atau penguji dapat menjelajahi seluruh halaman, menguji transisi, dan melihat keindahan antarmuka web secara *live*. 
    - Sifat Vercel yang tidak menyimpan perubahan database secara permanen saat kontainer melakukan *restart* justru menguntungkan untuk demo, karena web demo akan otomatis kembali bersih ke kondisi sampel bawaan (*pristine state*) tanpa kotor oleh data uji coba dosen penguji sebelumnya.

---

## Estetika & UI/UX (Premium Ultra-Modern Design System)

Untuk mewujudkan visual yang **MEWAH**, **INTERAKTIF**, dan **DINAMIS**, kita akan mengimplementasikan fitur-fitur front-end kelas atas berikut:

### 1. Header Pill-Floating Premium (Sesuai Gambar Referensi)
- Desain **Floating Navbar** berbentuk kapsul/pill melayang di tengah-atas layar.
- Background menggunakan warna gelap mewah (Deep Charcoal/Black) dengan efek **Glassmorphism (Backdrop Blur)** dan bayangan halus (soft drop-shadow).
- Logo beresolusi tinggi di sisi kiri, menu navigasi minimalis di tengah dengan hover effect garis memanjang, dan tombol Call-To-Action (CTA) berdesain bulat/kapsul dengan panah interaktif di sisi kanan.
- Navbar akan mengecil otomatis atau menyembunyikan diri dengan transisi halus saat di-scroll ke bawah, dan muncul kembali saat di-scroll ke atas (smart floating header).

### 2. Premium Page Preloader (Loading Awal)
- Halaman loading transisi yang sangat elegan saat pertama kali memuat web.
- Animasi logo berkilau atau inisial "HomeStay" dengan transisi fade-out melingkar yang mulus begitu aplikasi React selesai termuat (fully hydrated).

### 3. Scroll-Driven 3D & Parallax Interactions
- Efek **3D Tilt Card** interaktif pada kartu homestay: saat mouse mendekat atau melintasi kartu, kartu akan miring secara tiga dimensi mengikuti pergerakan kursor (interactive hover perspective).
- Elemen dekoratif latar belakang yang bergerak secara parallax 3D saat halaman di-scroll untuk memberikan efek kedalaman visual yang memukau.

### 4. Galeri Multi-Media Interaktif & Mewah (Luxury Media Gallery)
Mengingat media kamar homestay terdiri dari banyak foto dan video tur, kita akan merancang **Galeri Media Interaktif Kelas Atas**:
- **Foto Sampul Depan Mewah (Exterior Facade Cover - Sesuai Referensi):** 
  - Pada halaman beranda (Landing Page) dan kartu grid homestay, gambar utama yang ditampilkan adalah **Foto Tampak Depan / Halaman Luar Homestay** yang mewah.
  - Gambar ini dipoles dengan **efek gradasi memudar (*Soft Dark/Fade-Out Gradient*)** ke arah latar belakang gelap gulita (*Deep Black/Charcoal*) serta dikelilingi efek bayangan halus, memberikan kesan dramatis, mewah, dan berestetika tinggi layaknya halaman portofolio premium.
  - Menampilkan tulisan nama homestay dengan tipografi super tebal (*Bold Typo*), deskripsi singkat elegan, serta tombol Call-to-Action melayang di sisi kiri gambar (mirip tata letak Kintaro Portfolio).
- **Pemisahan Galeri Kamar & Detail:** Foto-foto bagian dalam kamar (kamar tidur, kamar mandi, ruang tamu) serta video tour sepenuhnya disimpan secara rapi di dalam **Luxury Media Gallery** halaman detail, sehingga halaman depan tetap terlihat bersih, minimalis, dan sangat eksklusif.
- **Kategori Filter Media (Tabbed Media):** Galeri di halaman detail dikelompokkan berdasarkan kategori yang bisa diklik (e.g., "Semua", "Kamar Tidur", "Kamar Mandi", "Ruang Tamu", "Video Walkthrough").
- **Dukungan Kategori Kustom (Isi Manual oleh Host):** Saat mengunggah foto/video di dasbor Host, jika kategori ruangan yang diinginkan tidak ada di pilihan bawaan, Host dapat memilih opsi **"Kustom / Lainnya"** dan mengetikkan nama kategori baru secara manual (misal: "Kolam Renang", "Halaman Depan", "Dapur"). Kategori kustom ini akan otomatis muncul sebagai Tab baru di halaman publik.
- **Premium Lightbox & Fullscreen Viewer:** Mengklik gambar apa pun akan membuka modal layar penuh dengan latar belakang buram transparan (*glassmorphism*).
- **Interactive Menu Kontrol Gambar:**
    - **Zoom In & Zoom Out:** Tombol perbesar/perkecil gambar (atau cubit layar di HP) untuk melihat detail kebersihan kamar atau fasilitas secara mendalam.
    - **Next & Previous Navigation:** Tombol navigasi melayang yang cantik di sisi kanan-kiri layar, mendukung geser (*swipe*) di HP.
    - **Download & Share Button:** Tombol premium untuk menyalin link foto atau membagikannya secara instan.
- **Integrasi Video Tour Walkthrough:**
    - Mendukung pemutaran video beresolusi tinggi (format MP4/WebM) dengan pemutar video kustom (*custom-styled HTML5 player*) berwarna gelap mewah yang memiliki kontrol putar/jeda interaktif, tombol bisukan (*mute*), dan kontrol kecepatan putar.

### 5. Dukungan Fleksibilitas Kustom (Custom Input Fallback)
Untuk memastikan sistem sangat fleksibel dan tidak kaku, kita menerapkan prinsip **Custom Input** di beberapa area dinamis:
- **Kategori Media:** Host bisa mengetik sendiri nama kategori foto jika tidak ada di pilihan standar.
- **Fasilitas (Amenities):** Host/Admin bisa menambahkan nama fasilitas kustom secara manual (misal: "Netflix Gratis", "Alat BBQ").
- **Metode Pembayaran:** Selain opsi populer (BSI, DANA, GoPay), Admin bisa memilih opsi "Custom" dan memasukkan jenis pembayaran apa saja (misal: "Bank Jatim", "LinkAja", "OVO") secara manual lengkap dengan input rekening/nomor HP.

### 6. Fluid Custom Cursor (Desktop Only)
- Kursor kustom yang terdiri dari titik tengah (dot) dan lingkaran luar yang halus (magnetic ring follower) yang melayang mengikuti mouse.
- **Morphing Effect:** Lingkaran luar akan membesar dan memeluk elemen tombol/link (magnetic pull) saat kursor berada di atas elemen interaktif tersebut.
- **Strict Mobile Safeguard:** Kursor kustom ini akan dinonaktifkan secara mutlak pada perangkat layar sentuh/HP menggunakan deteksi *media query* `(pointer: coarse)` atau pengecekan *touch capability*, memastikan kenyamanan navigasi di mobile tetap sempurna tanpa glitch kursor gantung.

### 6. Mobile Responsive & Premium Color Palette
- Tata letak yang dioptimalkan secara presisi untuk HP (Mobile-First Layout) dengan bottom navigation bar khusus mobile atau burger menu yang beranimasi halus.
- Palet warna premium: Skema gelap mewah (Deep Slate & Gold/Bronze Accents) yang harmonis dan transisi antar halaman yang sangat mulus menggunakan animasi transisi Inertia.

### 6. Modal Konfirmasi Interaktif & Mewah (Luxurious Confirmation Modals)
Untuk mencegah tindakan tidak sengaja pada momen krusial, kita akan membuat komponen **Modal Konfirmasi Premium** khusus:
- **Desain Glassmorphism Gelap:** Latar belakang modal menggunakan blur intens (*backdrop-blur-md*) dengan bayangan radial lembut di sekeliling kotak dialog modal.
- **Moment Krusial yang Diproteksi:**
  - Menghapus listing Homestay (oleh Host).
  - Melakukan Pembatalan Pemesanan/Booking (oleh Guest/Host).
  - Menyetujui (`Approve`) atau Menolak (`Reject`) bukti transfer tamu (oleh Host).
  - Menghapus akun pengguna atau merubah izin akses Host (oleh Admin).
- **Mikro-Animasi Memukau:** Efek transisi memantul lembut (*elastic scale-up spring*) saat modal terbuka, dan transisi meredup saat ditutup. Tombol aksi dilengkapi indikator loading statis jika transaksi sedang dikirim ke database.
- **Indikator Visual Premium:** Dilengkapi ikon 3D berkilau atau animasi berdenyut (*pulsing icons*) yang relevan dengan tipe tindakan (misal: warna merah membara untuk aksi penghapusan, warna hijau zamrud berkilau untuk aksi persetujuan).

### 7. Aksesibilitas & Ramah Pengunjung (User-Friendly Design)
- **Navigasi yang Jelas:** Menyediakan tombol **Kembali (Back)** yang selalu terlihat jelas di halaman detail, checkout, dan dasbor, serta sistem navigasi remah roti (*breadcrumbs*) agar pengunjung tidak pernah merasa tersesat.
- **Tipografi Premium & Jelas:** Menggunakan Google Fonts modern seperti **Outfit** (untuk judul mewah) dan **Inter** (untuk keterbacaan teks konten yang luar biasa tinggi). Ukuran font dan kontras warna diatur dengan standar WCAG agar nyaman di mata semua kalangan usia.
- **Kejelasan Status & Interaksi:** Setiap aksi (seperti memesan, mengunggah bukti transfer, atau login) akan menampilkan status indikator loading yang jelas, serta notifikasi sukses/gagal (*toast notifications*) yang interaktif.

---

## Sistem Keamanan Aplikasi (Security Specifications)

Untuk memastikan aplikasi tangguh dan aman dari berbagai ancaman siber (sangat krusial untuk poin penilaian UAS Web Lanjut), kita menerapkan standar keamanan tingkat tinggi berikut:

### 1. Perlindungan Autentikasi & Sesi
- **Rate Limiting (Login Throttling):** Membatasi percobaan login (maksimal 5 kali salah dalam 1 menit) menggunakan fitur bawaan Laravel Fortify untuk mencegah serangan *brute-force*.
- **CSRF Protection:** Melindungi setiap form transaksi (seperti checkout dan upload bukti bayar) dari serangan *Cross-Site Request Forgery* menggunakan token CSRF dinamis yang dikelola otomatis oleh Inertia.js.

### 2. Otorisasi Ketat & Pencegahan IDOR (Insecure Direct Object Reference)
- **Middleware & Gate/Policy Laravel:** 
  - Menerapkan penguncian rute yang ketat di backend. Host A sama sekali tidak bisa mengedit atau melihat detail homestay milik Host B, meskipun mereka mencoba memanipulasi ID di URL (mencegah eksploitasi IDOR).
  - Tamu (Guest) hanya bisa melihat riwayat booking milik mereka sendiri dan hanya bisa mengirim keluhan terkait homestay yang sedang mereka sewa secara aktif.

### 3. Keamanan & Kualitas Unggah Berkas (Secure & High-Quality File Uploads)
Mengingat aplikasi kita mendukung unggah foto homestay, bukti transfer, dan video tour berkualitas tinggi demi menonjolkan kemewahan properti, kita menerapkan kebijakan upload yang longgar namun sangat aman:
- **Validasi Format & Batasan Ukuran yang Longgar (Generous Limits):**
  - Kamera smartphone modern menghasilkan file yang besar. Oleh karena itu, kita membatasi ukuran maksimal secara longgar dan bersahabat: **Maksimum 15MB untuk foto** dan **Maksimum 100MB untuk berkas video walkthrough**.
  - Hanya menerima format berkas media aman (`jpg`, `jpeg`, `png`, `webp`) dan video (`mp4`, `webm`).
- **Sistem Watermarking Global Tanpa Mengurangi Kualitas (Lossless/High-Quality Watermarking):**
  - Saat media diunggah ke tabel **`homestay_media`** maupun **`room_media`**, pemrosesan backend (menggunakan library gambar Laravel seperti *Intervention Image*) diatur secara khusus untuk mempertahankan ketajaman gambar asli.
  - Pengaturan kualitas gambar diset ke **maksimal (Quality: 90-100)** untuk mencegah kompresi piksel pecah (*pixelation*) atau warna pudar.
  - Gambar watermark (PNG transparan) ditempelkan dengan perpaduan alpha channel (opacity) yang halus dan menyatu secara elegan di pojok kanan bawah foto tanpa merusak detail estetik kamar homestay.
- **Sanitisasi Nama Berkas:** Setiap berkas yang diunggah akan diganti namanya secara otomatis menggunakan string acak unik (*UUID/Hash*) dan disimpan di direktori non-executable `/storage/` untuk mencegah penyerang mengunggah dan mengeksekusi skrip PHP berbahaya (*Web Shell*).
- **SQL Injection Prevention:** Seluruh query database wajib menggunakan Eloquent ORM atau *Query Builder* Laravel dengan sistem parameterisasi otomatis (binding), menghindari penggunaan query SQL mentah (*raw queries*) yang tidak aman.
- **XSS Prevention:** React secara bawaan melakukan *escaping* otomatis pada seluruh data teks yang ditampilkan (seperti nama tamu, komentar ulasan, atau pesan aduan), memastikan kode JavaScript berbahaya yang disisipkan peretas tidak akan dieksekusi di browser pengguna lain.

### 5. Keamanan Transaksi Kalender & Integritas Data (Pencegahan Double Booking & Auto-Rollback)
Untuk menjamin data transaksi pemesanan 100% akurat tanpa ada celah kamar terpesan ganda (*double booking*) akibat *Race Conditions* (dua orang memesan kamar yang sama di detik yang bersamaan):
- **Database Transactions (`DB::transaction`):**
  - Seluruh proses pemesanan (dari mulai pengecekan kamar, pembuatan akun tamu otomatis, pembuatan tiket booking, hingga perekaman metode bayar) dibungkus dalam satu transaksi database tunggal.
  - **Sistem Auto-Rollback:** Jika di tengah-tengah proses terjadi gangguan koneksi, gagal validasi, atau kamar tiba-tiba sudah dipesan orang lain, Laravel secara otomatis akan melakukan **Rollback (membatalkan seluruh aksi sebelumnya secara total)**. Database akan dikembalikan bersih ke keadaan semula sebelum proses dimulai, mencegah adanya akun "yatim piatu" tanpa booking atau booking setengah jadi.
- **Pessimistic Locking (`lockForUpdate`):**
  - Saat tamu melakukan cek ketersediaan kamar pada proses checkout, baris data homestay dan tanggal yang bersangkutan akan dikunci sementara di tingkat database.
  - Jika ada request lain masuk di milidetik yang sama untuk kamar dan tanggal yang sama, request kedua akan dipaksa mengantri sampai transaksi pertama selesai. Jika transaksi pertama sukses terbayar, transaksi kedua akan otomatis ditolak secara aman oleh validasi sistem dan di-rollback.

### 6. Proteksi Interaksi & Pencegahan Kirim Ganda (Double-Submit Prevention)
Untuk menghindari kegagalan pemrosesan data, data skip, atau pembuatan data ganda (*duplicate records*) akibat pengguna mengklik tombol secara beruntun (*spamming clicks*):
- **Stateful Button Loading:** Setiap tombol tindakan krusial (seperti "Simpan", "Kirim Pemesanan", "Unggah Bukti", dsb.) akan langsung berubah status menjadi **Disabled (Nonaktif)** segera setelah diklik.
- **Visual Feedback:** Tombol akan menampilkan animasi putar loading mewah (*premium spinner*) atau teks berdenyut (misal: "Memproses data...") mengikuti estimasi proses di belakang layar, dan hanya akan aktif kembali setelah proses backend selesai mengembalikan respons. Hal ini secara fisik mengunci interaksi tamu/host sehingga proses di belakang layar terjamin aman berjalan 100%.

### 7. Perlindungan Hak Cipta Konten & Media (Content & Media Protection)
Untuk mencegah pencurian aset gambar dan teks deskripsi homestay oleh pihak lain, kita menambahkan perlindungan konten khusus:
- **Proteksi Media Gambar (Disable Copy/Save):**
  - **Disable Right-Click & Drag:** Mematikan fungsi klik-kanan (`contextmenu`) dan fitur geser gambar (`draggable="false"`) pada seluruh galeri foto homestay di sisi front-end React untuk menyulitkan tamu mengunduh gambar secara ilegal.
  - **Sistem Watermarking Global di Backend (Laravel GD/Intervention):** 
    - Saat Host mengunggah media baru ke tabel **`homestay_media`** (foto halaman depan, taman, kolam renang) maupun ke tabel **`room_media`** (foto kamar tidur, kamar mandi, dapur), backend Laravel secara otomatis memproses seluruh berkas tersebut.
    - Sistem akan membakar (*burn*) gambar watermark/logo semi-transparan berlogo platform secara permanen ke pojok gambar sebelum disimpan.
    - Untuk media video (.mp4/.webm), sistem backend (misal menggunakan library pendukung) juga akan membakar watermark di pojok video secara dinamis agar seluruh aset media platform terlindungi mutlak tanpa terkecuali.
- **Teks Proteksi dengan Watermark Salin (Copy-Paste Source Watermark):**
  - Mengimplementasikan JavaScript Event Listener pada event `copy` di seluruh website.
  - Ketika pengunjung menyalin teks (seperti deskripsi homestay atau alamat), sistem secara otomatis menambahkan watermark sumber saat mereka melakukan *paste* (misal: *"Salinan dari HomeStay-Apps. Baca selengkapnya di: https://homestay-apps.test/explore/slug"*).

---

## Daftar Halaman Aplikasi (Estimasi Halaman)

Untuk menghasilkan platform yang lengkap dan bernilai tinggi, aplikasi ini akan terdiri dari sekitar **14 halaman/tampilan utama** yang dikelompokkan sebagai berikut:

### A. Halaman Publik (Tamu & Umum - Bebas Diakses Tanpa Login)
1. **Landing Page (Home):** Hero banner megah, bar pencarian interaktif, daftar homestay terpopuler, dan FAQ singkat.
2. **Explore / Search Results Page:** Halaman pencarian homestay dengan filter tingkat lanjut (fasilitas, harga, kota) dilengkapi peta interaktif.
3. **Homestay Detail Page (Sangat Detail & Jelas - Menghindari Kesalahpahaman):**
   - **Galeri Foto Premium:** Menampilkan foto setiap sudut homestay secara terorganisir (kamar tidur, toilet, ruang tamu).
   - **Informasi Kapasitas Jelas:** Jumlah kamar tidur, jumlah tempat tidur, kamar mandi, serta batas maksimal jumlah tamu.
   - **Peta Lokasi Interaktif (Google Maps):** Embed Google Maps interaktif yang menunjukkan lokasi persis homestay untuk kejelasan rute tamu.
   - **Rincian Harga Transparan:** Menunjukkan harga per malam beserta simulasi total biaya menginap secara instan saat tanggal dipilih (menghindari biaya siluman).
   - **Aturan Menginap (House Rules):** Waktu Check-In/Check-Out yang jelas, serta peraturan homestay (misal: dilarang merokok, boleh membawa hewan peliharaan, dsb.).
   - **Fasilitas Terkelompok:** WiFi, AC, Kolam Renang, Handuk, Sabun, dsb. yang dikelompokkan berdasarkan kategori.
   - **Ulasan Terverifikasi:** Menampilkan skor rating rata-rata bintang (1-5) dan komentar ulasan asli dari tamu-tamu terdahulu.
4. **Checkout Page:** Halaman pembayaran yang menampilkan instruksi transfer, QRIS dinamis, form unggah bukti transfer, dan form pembuatan akun otomatis.
5. **Public Help Center / Hubungi Kami (Contact Us):** Halaman khusus bantuan bagi **pengunjung umum** (termasuk yang belum mendaftar/login). Berisi formulir pertanyaan langsung ke Admin serta FAQ interaktif lengkap untuk membantu calon tamu yang masih bingung memilih kamar.

### B. Dasbor Guest (Tamu Terautentikasi)
6. **Guest Dashboard Overview:** Ringkasan pemesanan aktif, riwayat pemesanan lama, dan akses cepat.
7. **Booking Detail & E-Receipt Page:** Tampilan detail reservasi lengkap dengan e-receipt dan form pengisian ulasan/bintang setelah status pemesanan selesai.
8. **Wishlist / Favorites Page:** Daftar homestay yang disimpan/disukai oleh tamu.
9. **Guest Complaint Panel (Pusat Keluhan Tamu):** Fitur khusus bagi tamu yang **sedang menginap** untuk mengirimkan keluhan langsung kepada Host (misal: "AC tidak dingin", "Kunci kamar rusak") sehingga terpantau langsung.

### C. Dasbor Host (Pemilik Homestay - Manajemen & Pemantauan Tamu)
10. **Host Dashboard Overview:** Grafik statistik pendapatan bulanan, pesanan aktif, dan ringkasan homestay.
11. **My Homestays (CRUD List):** Daftar homestay milik host dengan tombol cepat untuk aktif/nonaktifkan listing.
12. **Add/Edit Homestay Form:** Form interaktif untuk mengunggah galeri foto homestay, memilih fasilitas, dan mengatur harga.
13. **Guest Monitor & Active Stays (Pemantauan Tamu):** Panel khusus Host untuk memantau tamu yang sedang menginap secara real-time (Nama tamu, WhatsApp, tanggal check-in/out, dan status stay).
14. **Booking Requests & Payments Management:** Halaman untuk mengelola booking masuk, memeriksa bukti transfer tamu, serta melakukan persetujuan/penolakan (Approve/Reject).
15. **Host Complaints Monitor (Pemantauan Aduan Tamu):** Panel untuk menerima aduan/keluhan langsung dari tamu aktif dan menandainya jika keluhan sudah diatasi (*resolved*).

### D. Dasbor Admin (Pengelola Sistem Tertinggi / Super Admin)
16. **Admin Dashboard Overview:** Statistik keseluruhan platform (total user, total transaksi, total homestay).
17. **User Management Panel (CRUD User):** 
    - Panel kontrol utama untuk mengelola semua data pengguna (Guest, Host, Admin).
    - Fitur edit detail data Tamu (jika mereka salah memasukkan info saat auto-register) dan pembuatan akun Host baru secara langsung.
18. **Host Permissions Settings (RBAC Manager - Fitur Eksklusif Admin):**
    - Panel canggih untuk mengatur hak akses (*Permissions*) setiap akun Host secara dinamis.
    - Admin dapat mencentang/toggle izin fitur apa saja yang boleh dibuka oleh Host tersebut (misal: toggle izin "Melihat Pendapatan", "Menambah Homestay", "Menghapus Homestay", dsb.). Menu di dasbor Host akan otomatis muncul/hilang secara dinamis mengikuti izin dari Admin ini.
19. **Payment Methods Management:** Halaman CRUD bagi Admin untuk mengelola data nomor rekening BSI/SeaBank dan mengunggah gambar QRIS E-Wallet (DANA/GoPay/ShopeePay).
20. **Public Support Tickets (Pusat Tiket Publik):** Panel khusus untuk membaca dan merespons pertanyaan/pesan dari formulir bantuan publik (Help Center) yang dikirim oleh pengunjung yang belum terdaftar.
21. **Global Amenities Manager:** Panel untuk mengelola fasilitas global (WiFi, AC, dsb.) yang bisa dipilih oleh Host saat membuat listing homestay.
22. **Branding & Protection Settings (Pengaturan Branding & Proteksi Media):** 
    - Halaman konfigurasi dinamis bagi Admin untuk memperbarui **Logo Website**, **Favicon/Icon**, **Gambar/Logo Watermark** (yang akan ditempel di foto homestay), dan **Teks Watermark Copas** secara real-time.

---

## Rencana Verifikasi (Testing Plan)
### Automated Tests (Pest)
- Test registrasi & otorisasi berdasarkan role.
- Test CRUD homestay oleh host.
- Test alur booking (menghindari double booking pada tanggal yang sama).
- Test penulisan review hanya bisa dilakukan setelah booking selesai.

### Manual Verification
- Melakukan pengujian alur pencarian, pemesanan, dan responsivitas UI pada browser.

---

## Rencana Penyempurnaan Landing Page, Alur Registrasi, Halaman Login, & Notifikasi Checkout (Phase 8)

### 1. Penambahan Informasi di Beranda (Landing Page)
- **Slogan Mewah:** Menambahkan slogan bernada premium di Welcome Page.
- **Kata Sambutan Harian (Dynamic Daily Quote):** Menambahkan bar kata sambutan mutiara yang berganti secara dinamis setiap harinya berdasarkan tanggal kalender peramban (`new Date().getDate()`).
- **Testimoni & Review Pengunjung:** Menambahkan galeri review & rating testimoni eksklusif di beranda dengan tipografi elegan dan tata letak *grid card*.

### 2. Penonaktifan Registrasi Manual & Kustomisasi Halaman Login Mewah
- **Hilangkan Link Register:** Menghapus link/tombol "Register" dari header (`PillNavbar.tsx`) dan halaman login (`login.tsx`), karena akun tamu dibuat secara otomatis saat melakukan checkout.
- **Halaman Login Mewah (Luxury Design):** Mengubah template layout autentikasi (`auth-simple-layout.tsx`) dan halaman login (`login.tsx`) agar berestetika gelap-emas mewah (*dark & gold glassmorphism*) dengan *glow visual*, input gelap-emas kustom, dan tombol modern.

### 3. Notifikasi Pengingat Checkout & Reservasi yang Terus Muncul
- **E-Receipt Success Banner (`success.tsx`):** Menambahkan panel instruksi dan peringatan wajib (Pembayaran, Kelengkapan Data Profil, Kontak WhatsApp Host) di bagian atas halaman sukses reservasi.
- **Guest Dashboard Alert Banner (`dashboard.tsx`):** Menampilkan banner peringatan serupa secara terus-menerus di dasbor tamu apabila tamu tersebut memiliki reservasi aktif berstatus `pending_payment` atau `pending_approval`.

### 4. Penyesuaian Halaman Detail Kamar (`show.tsx`)
- **Nama Tombol Pesan Kamar:** Mengubah label tombol dari *"Pesan Penginapan Mewah"* menjadi *"Pesan Kamar"* demi keselarasan konsep kamar homestay.
- **Hapus Peta Lokasi Kamar:** Menghapus iframe Google Maps dari halaman detail kamar karena seluruh kamar berada di lokasi fisik yang sama (Yuri Homestay Lhokseumawe). Informasi peta terpusat hanya ada di halaman publik pencarian/beranda.

## Rencana Verifikasi (Testing Plan - Phase 8)
- Memastikan aset terkompilasi sukses dengan `npm run build`.
- Menjalankan kembali 42 Pest tests.
- Menggunakan browser subagent untuk memverifikasi halaman login mewah dan fungsionalitas detail kamar tanpa peta.

---

## Rencana Penyempurnaan & Kelengkapan Admin Panel serta Konsistensi Tombol (Phase 9)

### 1. Integrasi Fitur Host ke Admin (Kelola Kamar, Reservasi, Stays, Aduan)
- **Middleware & Akses Kontrol Baru:** Memodifikasi middleware di `HostController.php` agar dapat diakses oleh Admin (`role === 'admin'`).
- **Pembersihan Filter User ID:** Menyesuaikan query di dalam `HostController.php` agar ketika Admin mengakses fitur tersebut, query tidak difilter berdasarkan `user_id` milik Admin (sehingga Admin dapat melihat dan mengelola seluruh Kamar/Homestay, reservasi, tamu menginap, dan keluhan yang ada di platform secara global).
- **Pengalihan Halaman Dinamis:** Mengarahkan redirect sukses di controller secara dinamis ke rute `admin.*` jika user terautentikasi adalah Admin, atau `host.*` jika adalah Host.
- **Rute Admin Baru:** Mendefinisikan rute duplikat khusus admin untuk kamar, reservasi, stays, dan aduan di `routes/web.php` yang mengarah ke controller yang sama.

### 2. Navigasi Sidebar Admin
- **Sidebar Menu:** Menambahkan tautan Kelola Kamar, Reservasi Masuk, Tamu Menginap, dan Keluhan Tamu ke menu navigasi khusus Admin di `app-sidebar.tsx`.

### 3. Penyesuaian Antarmuka Halaman Dinamis & Dinamika Prefix Rute
- **Prefix Rute Dinamis:** Memodifikasi pemanggilan `route('host.*')` di halaman-halaman berikut agar menggunakan prefix dinamis berdasarkan role user (`admin` atau `host`):
  - `host/homestays/index.tsx`
  - `host/homestays/create.tsx`
  - `host/homestays/edit.tsx`
  - `host/reservations/index.tsx`
  - `host/complaints/index.tsx`
- **Tipografi Header Dinamis:** Mengubah teks header "Portal Pemilik" menjadi "Portal Administrator" dan "Daftar Properti Anda" menjadi "Daftar Semua Kamar" pada halaman-halaman tersebut jika diakses oleh akun Admin.

### 4. Konsistensi Tombol (Rata Kanan Dialog Footer)
- **Ubah Centered Footer ke Rata Kanan:** Mengubah semua layout `DialogFooter` yang sebelumnya menggunakan `flex justify-center` (centered) pada modal konfirmasi hapus/aksi kritis menjadi `flex justify-end gap-2` (rata kanan) agar konsisten dengan form input modal lainnya. Perubahan ini diterapkan pada file:
  - `admin/users/index.tsx`
  - `admin/payments/index.tsx`
  - `admin/support/index.tsx`
  - `host/homestays/index.tsx`
  - `host/reservations/index.tsx`
  - `host/complaints/index.tsx`
  - `host/dashboard.tsx`

## Rencana Verifikasi (Testing Plan - Phase 9)
- Memastikan seluruh kode terformat dengan baik menggunakan Pint: `vendor/bin/pint --dirty --format agent`.
- Memastikan aset terkompilasi sukses dengan `npm run build`.
- Menjalankan seluruh test suite Pest untuk menjamin tidak ada regresi fungsionalitas.
- Melakukan verifikasi visual di browser dengan masuk menggunakan akun Super Admin (`admin@homestay.com` / `password`) dan memastikan menu Kelola Kamar, Reservasi, Stays, dan Aduan dapat diakses dan berjalan dengan sempurna secara global.
