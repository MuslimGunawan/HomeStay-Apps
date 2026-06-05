import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Users, ShieldCheck, CreditCard, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import LuxuryLayout from '@/layouts/LuxuryLayout';

interface PaymentMethod {
    id: number;
    name: string;
    type: string;
    account_number: string;
    account_name: string;
    qris_image_path?: string;
}

interface Homestay {
    id: number;
    name: string;
    price_per_night: number;
    max_guests: number;
}

interface CheckoutProps {
    homestay: Homestay;
    paymentMethods: PaymentMethod[];
    checkIn: string;
    checkOut: string;
    totalGuests: number;
    totalPrice: number;
    days: number;
}

export default function Checkout({ homestay, paymentMethods = [], checkIn, checkOut, totalGuests, totalPrice, days }: CheckoutProps) {
    const { auth } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        homestay_id: homestay.id,
        payment_method_id: paymentMethods[0]?.id || '',
        check_in: checkIn,
        check_out: checkOut,
        total_guests: totalGuests,
        // Registration details if Guest not logged in
        name: '',
        email: '',
        phone: '',
    });

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(paymentMethods[0] || null);

    const handleMethodChange = (id: string | number) => {
        const method = paymentMethods.find(m => m.id === parseInt(id.toString())) || null;
        setSelectedMethod(method);
        setData('payment_method_id', id);
    };

    const [showPasswordPreview, setShowPasswordPreview] = useState(false);

    const submitBooking = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout/store');
    };

    // Calculate temporary password dynamically for premium preview in UI
    const getTempPasswordPreview = () => {
        if (!data.phone) {
return 'Homestay@[Nomor_WhatsApp]';
}

        return `Homestay@${data.phone}`;
    };

    return (
        <LuxuryLayout>
            <Head title="Checkout Pemesanan Homestay" />

            <div className="mx-auto max-w-5xl w-full px-6 py-12 md:px-8 space-y-10 text-left">
                <div className="border-b border-white/5 pb-6">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest font-outfit">Proses Reservasi</span>
                    <h1 className="font-outfit text-3xl font-extrabold text-white mt-1">Checkout Pembayaran</h1>
                </div>

                <form onSubmit={submitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left & Middle: Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. Account / Contact Details */}
                        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-4">
                            <h3 className="font-outfit text-base font-bold text-white flex items-center border-b border-white/5 pb-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-bold mr-2">1</span>
                                Informasi Tamu & Pembuat Akun
                            </h3>

                            {auth?.user ? (
                                <div className="p-4 bg-gold/5 border border-gold/20 rounded-2xl text-xs space-y-1">
                                    <p className="font-bold text-white">Akun Aktif Terdeteksi</p>
                                    <p className="text-white/60">Tamu: {auth.user.name} ({auth.user.email})</p>
                                    <p className="text-[10px] text-gold mt-1">✓ Pemesanan ini akan langsung dikaitkan ke riwayat dasbor Anda secara aman.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-[11px] text-blue-300 leading-relaxed">
                                        <p className="font-bold mb-1">⚡ Fitur Auto-Register Aktif</p>
                                        Akun baru Anda akan dibuat secara otomatis menggunakan data email & WhatsApp di bawah ini. Sandi sementara akan diberikan saat sukses pemesanan.
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Cth: Rian Kurniawan"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                            />
                                            {errors.name && <span className="text-[10px] text-red-400">{errors.name}</span>}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Alamat Email</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="Cth: rian@email.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                            />
                                            {errors.email && <span className="text-[10px] text-red-400">{errors.email}</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Nomor WhatsApp Aktif</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Cth: 08123456789"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                        />
                                        {errors.phone && <span className="text-[10px] text-red-400">{errors.phone}</span>}
                                    </div>

                                    {/* Eyes password preview */}
                                    <div className="p-4 bg-deep-charcoal border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                                        <div>
                                            <span className="block text-[9px] font-bold text-white/30 uppercase tracking-wider">Password Sementara Anda</span>
                                            <span className="font-mono font-semibold text-gold tracking-wide block mt-0.5">
                                                {showPasswordPreview ? getTempPasswordPreview() : '••••••••••••••••'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordPreview(!showPasswordPreview)}
                                            className="text-white/60 hover:text-gold transition-colors"
                                        >
                                            {showPasswordPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Payment Method Selector */}
                        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-4">
                            <h3 className="font-outfit text-base font-bold text-white flex items-center border-b border-white/5 pb-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-bold mr-2">2</span>
                                Metode Pembayaran Transfer Manual
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        onClick={() => handleMethodChange(method.id)}
                                        className={`flex flex-col p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                                            data.payment_method_id.toString() === method.id.toString()
                                                ? 'bg-gold/5 border-gold shadow-md'
                                                : 'bg-black/30 border-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        <span className="text-xs font-bold text-white block">{method.name}</span>
                                        <span className="text-[10px] text-white/40 mt-1 capitalize">{method.type === 'ewallet' ? 'E-Wallet QRIS' : 'Transfer Bank'}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Show details based on selected payment method */}
                            {selectedMethod && (
                                <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-4">
                                    <div className="space-y-1">
                                        <span className="block text-[8px] font-bold text-white/30 uppercase tracking-widest">Instruksi Transfer</span>
                                        <p className="text-xs text-white leading-relaxed">
                                            Silakan transfer tepat sebesar nominal tagihan setelah booking dikirimkan, ke rekening resmi homestay berikut:
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="block text-[9px] text-white/40 uppercase">Atas Nama</span>
                                                <span className="text-xs font-bold text-white">{selectedMethod.account_name}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] text-white/40 uppercase">{selectedMethod.type === 'ewallet' ? 'Nomor OVO/GoPay' : 'Nomor Rekening'}</span>
                                                <span className="text-sm font-mono font-bold text-gold tracking-wider">{selectedMethod.account_number}</span>
                                            </div>
                                        </div>

                                        {selectedMethod.qris_image_path && (
                                            <div className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl w-32 h-32 mx-auto md:mr-0 shrink-0 shadow-lg">
                                                <img src={selectedMethod.qris_image_path} alt="QRIS" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Booking Summary card */}
                    <div className="space-y-6">
                        <div className="bg-[#111111] border border-gold/20 p-6 rounded-3xl space-y-6 shadow-2xl">
                            <h3 className="font-outfit text-sm font-bold tracking-widest text-gold uppercase border-b border-white/5 pb-3">Ringkasan Reservasi</h3>

                            <div className="space-y-4">
                                <div>
                                    <span className="block text-[9px] text-white/30 uppercase">Nama/Tipe Kamar</span>
                                    <span className="text-sm font-bold text-white block mt-0.5">{homestay.name}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-[9px] text-white/30 uppercase">Check-in</span>
                                        <span className="text-xs font-semibold text-white flex items-center mt-0.5">
                                            <Calendar className="h-3.5 w-3.5 text-gold mr-1.5 shrink-0" />
                                            {checkIn}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] text-white/30 uppercase">Check-out</span>
                                        <span className="text-xs font-semibold text-white flex items-center mt-0.5">
                                            <Calendar className="h-3.5 w-3.5 text-gold mr-1.5 shrink-0" />
                                            {checkOut}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-[9px] text-white/30 uppercase">Durasi Sewa</span>
                                        <span className="text-xs font-semibold text-white mt-0.5 block">{days} Malam</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] text-white/30 uppercase">Jumlah Tamu</span>
                                        <span className="text-xs font-semibold text-white flex items-center mt-0.5">
                                            <Users className="h-3.5 w-3.5 text-gold mr-1.5 shrink-0" />
                                            {totalGuests} Orang
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Pricing info */}
                            <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                                <div className="flex justify-between text-white/50">
                                    <span>Durasi {days} malam</span>
                                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-gold text-sm">
                                    <span>Total Pembayaran</span>
                                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Confirm Submit Action CTA with double click prevention */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gold text-deep-black font-extrabold text-xs py-4 rounded-xl transition-all hover:bg-white active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                <span>{processing ? 'Memproses Reservasi...' : 'Kirim Pemesanan Sekarang'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </LuxuryLayout>
    );
}
