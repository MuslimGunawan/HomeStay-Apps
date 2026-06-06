import { Head, Link, useForm } from '@inertiajs/react';
import { Clipboard, Check, Eye, EyeOff, UploadCloud, FileText, CheckCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import LuxuryLayout from '@/layouts/LuxuryLayout';
import DragDropUpload from '@/components/DragDropUpload';

interface Booking {
    id: number;
    total_price: number;
    check_in: string;
    check_out: string;
    status: string;
    payment_method: {
        name: string;
        type: string;
        account_number: string;
        account_name: string;
        qris_image_path?: string;
    };
    homestay: {
        name: string;
    };
}

interface SuccessProps {
    booking: Booking;
    tempPassword?: string;
    newUser: boolean;
}

export default function Success({ booking, tempPassword, newUser }: SuccessProps) {
    const { data, setData, post, processing, progress } = useForm({
        payment_receipt: null as File | null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (tempPassword) {
            navigator.clipboard.writeText(tempPassword);
            setCopied(true);
            toast.success('Password sementara berhasil disalin ke papan klip!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('payment_receipt', e.target.files[0]);
        }
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.payment_receipt) {
            toast.error('Silakan pilih berkas bukti pembayaran terlebih dahulu.');

            return;
        }

        post(`/bookings/${booking.id}/receipt`, {
            onSuccess: () => {
                toast.success('Bukti pembayaran berhasil diunggah. Menunggu verifikasi pemilik Homestay.');
            },
        });
    };

    return (
        <LuxuryLayout>
            <Head title="Pemesanan Homestay Berhasil" />

            <div className="mx-auto max-w-4xl w-full px-6 py-12 md:px-8 space-y-8 text-left">
                
                {/* 1. Success Splash Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-6 bg-gold/5 border border-gold/10 rounded-3xl">
                    <CheckCircle className="h-14 w-14 text-gold animate-bounce" />
                    <h1 className="font-outfit text-2xl font-extrabold text-white md:text-3xl">Reservasi Sukses Dikirim!</h1>
                    <p className="text-xs text-white/50 max-w-md leading-relaxed">
                        Terima kasih atas kepercayaan Anda menginap bersama kami. Sistem telah merekam detail reservasi Anda secara aman.
                    </p>
                </div>

                {/* Persistent Reservation Checklist / Alert Notice */}
                <div className="bg-[#111111] border border-gold/30 p-6 rounded-3xl text-left space-y-4">
                    <div className="flex items-center space-x-2 text-gold">
                        <AlertTriangle className="h-5 w-5 animate-pulse" />
                        <h4 className="font-outfit font-bold text-sm tracking-wide uppercase">PENTING: Langkah Wajib Setelah Reservasi</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                        Harap perhatikan beberapa hal penting berikut demi kelancaran check-in dan kenyamanan menginap Anda:
                    </p>
                    <ul className="space-y-3 text-xs text-white/70 pl-1">
                        <li className="flex items-start gap-2">
                            <span className="bg-gold/15 text-gold text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0">1</span>
                            <div>
                                <strong className="text-white block">Selesaikan Pembayaran Tagihan:</strong>
                                Lakukan transfer pembayaran sesuai detail rekening di bawah ini dan segera unggah foto bukti transfer pada kolom konfirmasi pembayaran di halaman ini atau melalui dasbor Anda.
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-gold/15 text-gold text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0">2</span>
                            <div>
                                <strong className="text-white block">Lengkapi Data Penginap:</strong>
                                Masuk ke dasbor Anda, buka menu profil, dan pastikan Anda melengkapi data diri/penginap (nomor telepon, foto profil) untuk proses verifikasi oleh pengelola homestay.
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-gold/15 text-gold text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0">3</span>
                            <div>
                                <strong className="text-white block">Hubungi Pemilik Penginapan (Host):</strong>
                                Jika ada kebingungan, pertanyaan mengenai fasilitas, atau kendala lainnya, harap langsung hubungi pemilik via WhatsApp untuk berkomunikasi langsung secara cepat.
                            </div>
                        </li>
                    </ul>
                </div>

                {/* 2. New User Account Card (Auto-Register) */}
                {newUser && tempPassword && (
                    <div className="bg-[#111111] border border-gold/30 p-6 rounded-3xl space-y-4">
                        <div className="border-b border-white/5 pb-3">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-wider block font-outfit">Akun Tamu Anda Telah Aktif!</span>
                            <h3 className="font-outfit text-base font-bold text-white mt-1">Detail Login Sementara</h3>
                        </div>

                        <p className="text-[11px] text-white/50 leading-relaxed">
                            Kami telah membuatkan akun guest secara otomatis untuk memudahkan Anda mengunduh E-Receipt dan mengunggah bukti bayar. Gunakan kredensial di bawah ini:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="bg-black/30 p-4 border border-white/5 rounded-2xl">
                                <span className="text-[9px] text-white/30 uppercase tracking-widest block">Email Akun</span>
                                <span className="font-semibold text-xs text-white block mt-1">Gunakan Email saat checkout</span>
                            </div>

                            {/* Password */}
                            <div className="bg-black/30 p-4 border border-white/5 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest block">Password Sementara</span>
                                    <span className="font-mono font-bold text-gold text-sm block mt-1 tracking-wider">
                                        {showPassword ? tempPassword : '••••••••••••'}
                                    </span>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-white/60 hover:text-gold transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="text-white/60 hover:text-gold transition-colors p-2 border border-white/10 rounded-lg hover:border-gold"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-gold/5 border border-gold/10 rounded-2xl text-[10px] text-gold/80 leading-tight">
                            * Banner pengingat akan muncul di dasbor Anda sebagai petunjuk keamanan untuk mengubah password sementara bawaan ini.
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Payment instruction manual */}
                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-6">
                        <div className="border-b border-white/5 pb-3">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Detail Transfer</span>
                            <h3 className="font-outfit text-base font-bold text-white mt-1">Pembayaran Tagihan</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="block text-[9px] text-white/30 uppercase">Nama Homestay</span>
                                <span className="text-xs font-bold text-white block mt-0.5">{booking.homestay.name}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[9px] text-white/30 uppercase">Metode Bayar</span>
                                    <span className="text-xs font-bold text-white block mt-0.5">{booking.payment_method.name}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] text-white/30 uppercase">Total Tagihan</span>
                                    <span className="text-xs font-bold text-gold block mt-0.5 font-outfit">
                                        Rp {parseFloat(booking.total_price as any).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Account details */}
                            <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3">
                                <div>
                                    <span className="block text-[9px] text-white/40 uppercase">Atas Nama</span>
                                    <span className="text-xs font-bold text-white">{booking.payment_method.account_name}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] text-white/40 uppercase">Nomor Rekening/HP</span>
                                    <span className="text-sm font-mono font-bold text-gold tracking-widest">{booking.payment_method.account_number}</span>
                                </div>

                                {booking.payment_method.qris_image_path && (
                                    <div className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl w-28 h-28 mx-auto mt-2 shadow-md shrink-0">
                                        <img src={booking.payment_method.qris_image_path} alt="QRIS" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Upload receipt form */}
                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-6">
                        <div className="border-b border-white/5 pb-3">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-outfit">Unggah Bukti Bayar</span>
                            <h3 className="font-outfit text-base font-bold text-white mt-1">Konfirmasi Transfer</h3>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <DragDropUpload 
                                onChange={(file) => setData('payment_receipt', file)}
                                value={data.payment_receipt}
                                accept="image/*"
                                maxSizeMB={15}
                                placeholderText="Drag & drop foto bukti transfer di sini"
                            />

                            {progress && (
                                <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                                    <div className="bg-gold h-full rounded-full transition-all" style={{ width: `${progress.percentage}%` }}></div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing || !data.payment_receipt}
                                className="w-full bg-gold disabled:bg-gold/40 text-deep-black font-extrabold text-xs py-4 rounded-xl transition-all hover:bg-white active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span>{processing ? 'Sedang Mengunggah...' : 'Konfirmasi Bukti Transfer'}</span>
                            </button>

                            <Link
                                href="/dashboard"
                                className="w-full border border-white/10 hover:border-white/20 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Masuk ke Dasbor Saya</span>
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </LuxuryLayout>
    );
}
