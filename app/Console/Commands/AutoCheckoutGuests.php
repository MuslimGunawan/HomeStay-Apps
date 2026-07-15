<?php

namespace App\Console\Commands;

use App\Mail\CheckoutNotification;
use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('app:auto-checkout-guests')]
#[Description('Otomatis menyelesaikan reservasi dan mengirimkan email terima kasih ke tamu yang masa tinggalnya habis hari ini.')]
class AutoCheckoutGuests extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now()->format('Y-m-d');

        // Cari reservasi berstatus 'confirmed' dengan tanggal check-out <= hari ini
        $bookings = Booking::with(['homestay', 'guest'])
            ->where('status', 'confirmed')
            ->where('check_out', '<=', $today)
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('Tidak ada tamu yang dijadwalkan check-out hari ini.');

            return;
        }

        $this->info('Memulai proses auto-checkout untuk '.$bookings->count().' reservasi...');

        foreach ($bookings as $booking) {
            // Update status ke completed
            $booking->update([
                'status' => 'completed',
            ]);

            // Kirim email terima kasih otomatis
            try {
                if ($booking->guest->email) {
                    Mail::to($booking->guest->email)->send(new CheckoutNotification($booking));
                }
            } catch (\Exception $e) {
                $this->error("Gagal mengirim email ke {$booking->guest->email}: ".$e->getMessage());
            }

            $this->line("Tamu {$booking->guest->name} di {$booking->homestay->name} berhasil di-check-out secara otomatis.");
        }

        $this->info('Proses auto-checkout selesai.');
    }
}
