<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicSupportController extends Controller
{
    /**
     * Show Support / Contact Us Page.
     */
    public function showHelpCenter()
    {
        return Inertia::render('support/help-center', [
            'faqs' => [
                [
                    'question' => 'Bagaimana cara memesan homestay di platform ini?',
                    'answer' => 'Sangat mudah! Pilih homestay impian Anda, masukkan tanggal check-in & check-out, jumlah tamu, dan langsung selesaikan pemesanan di halaman Checkout. Akun tamu Anda akan dibuatkan otomatis secara instan!',
                ],
                [
                    'question' => 'Apakah saya harus mendaftar akun terlebih dahulu?',
                    'answer' => 'Tidak wajib. Kami merancang fitur Auto-Register pada Checkout, di mana akun Anda otomatis dibuatkan saat Anda mengirimkan pesanan pertama kali.',
                ],
                [
                    'question' => 'Bagaimana cara melakukan pembayaran?',
                    'answer' => 'Kami menggunakan sistem transfer manual. Anda dapat melakukan pembayaran via BSI, SeaBank, DANA, atau GoPay, lalu mengunggah foto bukti transfer di dasbor tamu Anda.',
                ],
                [
                    'question' => 'Apakah saya bisa membatalkan pesanan?',
                    'answer' => 'Pembatalan dapat diajukan melalui dasbor Guest atau menghubungi Host terkait secara langsung via tombol WhatsApp yang terintegrasi di sistem.',
                ],
            ],
        ]);
    }

    /**
     * Handle Public Support Contact Form submission.
     */
    public function submitSupport(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        SupportTicket::create([
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Pesan Anda berhasil dikirim ke Admin. Kami akan membalas via email secepatnya.');
    }
}
