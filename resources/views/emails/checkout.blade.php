@component('mail::message')
# Terima Kasih Telah Menginap!

Halo **{{ $booking->guest->name }}**,

Terima kasih banyak telah memilih menginap di **{{ $booking->homestay->name }}**. Kami mengonfirmasi bahwa proses check-out Anda telah selesai diproses oleh Host kami.

**Detail Reservasi Anda:**
* **Kode Booking:** #{{ $booking->id }}
* **Tanggal Menginap:** {{ $booking->check_in->format('d/m/Y') }} s/d {{ $booking->check_out->format('d/m/Y') }}
* **Total Biaya:** Rp {{ number_format($booking->total_price, 0, ',', '.') }}

Kami sangat mengharapkan masukan Anda. Mohon luangkan waktu sejenak untuk memberikan ulasan terbaik Anda pada dasbor tamu kami untuk membantu kami meningkatkan layanan staycation kami berikutnya.

@component('mail::button', ['url' => url('/guest/bookings')])
Berikan Ulasan / Rating
@endcomponent

Salam Hangat,<br>
Tim Management {{ $booking->homestay->name }}
@endcomponent
