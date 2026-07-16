import { Head, useForm, router, Link } from '@inertiajs/react';
import { 
    ShoppingCart, 
    Trash2, 
    CreditCard, 
    Calendar, 
    Users, 
    ArrowRight, 
    AlertCircle, 
    Home,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import LuxuryLayout from '@/layouts/LuxuryLayout';

interface CartItem {
    id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    days: number;
    price_subtotal: number;
    homestay: {
        id: number;
        name: string;
        city: string;
        address: string;
        price_per_night: number;
        media: Array<{ file_path: string; is_primary: boolean }>;
    };
}

interface PaymentMethod {
    id: number;
    name: string;
    type: string;
    account_number: string;
    account_name: string;
    qris_image_path?: string;
}

interface CartProps {
    cartItems: CartItem[];
    paymentMethods: PaymentMethod[];
    auth: {
        user: any;
    };
}

export default function Cart({ cartItems = [], paymentMethods = [], auth }: CartProps) {
    const [selectedPayment, setSelectedPayment] = useState<number | null>(
        paymentMethods.length > 0 ? paymentMethods[0].id : null
    );

    const checkoutForm = useForm({
        payment_method_id: selectedPayment,
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: auth?.user?.phone || '',
    });

    const totalBill = cartItems.reduce((acc, item) => acc + item.price_subtotal, 0);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleRemoveItem = (id: number) => {
        router.delete(`/guest/cart/${id}`, {
            onSuccess: () => {
                toast.success('Kamar berhasil dihapus dari keranjang.');
            }
        });
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPayment) {
            toast.error('Silakan pilih metode pembayaran terlebih dahulu.');
            return;
        }

        checkoutForm.setData('payment_method_id', selectedPayment);
        checkoutForm.post('/guest/cart/checkout', {
            onSuccess: () => {
                toast.success('Pemesanan multi-kamar berhasil dibuat!');
            },
            onError: (errors) => {
                if (errors.cart) {
                    toast.error(errors.cart);
                } else {
                    toast.error('Gagal memproses checkout. Harap periksa formulir.');
                }
            }
        });
    };

    const activePaymentMethod = paymentMethods.find(p => p.id === selectedPayment);

    return (
        <LuxuryLayout>
            <Head title="Keranjang Belanja Homestay" />
            
            <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
                {/* Header Title */}
                <div className="flex flex-col gap-2 text-left">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
                        <ShoppingCart className="h-4 w-4" />
                        Premium Cart
                    </span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight md:text-5xl text-neutral-900 dark:text-white">
                        Keranjang Belanja Kamar
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-white/50 max-w-xl">
                        Tinjau seluruh kamar pilihan Anda untuk keluarga & kerabat. Selesaikan transaksi dalam satu kali pembayaran terpadu.
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 rounded-3xl border border-dashed border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5">
                        <div className="h-16 w-16 bg-gold/10 text-gold rounded-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8" />
                        </div>
                        <h3 className="font-outfit text-xl font-bold text-neutral-800 dark:text-white">Keranjang Anda Kosong</h3>
                        <p className="text-xs text-neutral-500 dark:text-white/40 max-w-xs leading-relaxed">
                            Cari dan pilih kamar eksklusif kami di berbagai homestay pilihan sebelum melanjutkan checkout.
                        </p>
                        <Link 
                            href="/explore" 
                            className="bg-gold hover:bg-white text-black font-bold text-xs py-3.5 px-8 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            Jelajahi Kamar Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Cart List (Left) */}
                        <div className="lg:col-span-2 space-y-6">
                            {cartItems.map((item) => {
                                const primaryImg = item.homestay.media.find(m => m.is_primary) || item.homestay.media[0];

                                return (
                                    <div 
                                        key={item.id}
                                        className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#111111] p-5 flex flex-col sm:flex-row gap-5 text-left transition-all duration-300 hover:shadow-xl dark:hover:shadow-gold/5"
                                    >
                                        {/* Image */}
                                        <div className="w-full sm:w-48 aspect-video sm:aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-white/5 shrink-0 relative">
                                            <img 
                                                src={primaryImg?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'} 
                                                alt={item.homestay.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Detail info */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start gap-4">
                                                    <h3 className="font-outfit text-base md:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                                                        {item.homestay.name}
                                                    </h3>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-2 rounded-xl bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/10 transition-all cursor-pointer"
                                                        title="Hapus dari keranjang"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                
                                                <span className="inline-block text-[10px] bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-bold">
                                                    Rp {parseFloat(item.homestay.price_per_night as any).toLocaleString('id-ID')}/malam
                                                </span>
                                            </div>

                                            {/* Date details */}
                                            <div className="grid grid-cols-2 gap-4 text-xs text-neutral-500 dark:text-white/60 border-t border-neutral-100 dark:border-white/5 pt-4 mt-4">
                                                <div className="space-y-1">
                                                    <span className="block text-[9px] uppercase font-bold text-neutral-400 dark:text-white/20">Stay Schedule</span>
                                                    <span className="font-bold text-neutral-800 dark:text-white flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
                                                        {formatDate(item.check_in)} - {formatDate(item.check_out)}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[9px] uppercase font-bold text-neutral-400 dark:text-white/20">Tamu & Durasi</span>
                                                    <span className="font-bold text-neutral-800 dark:text-white flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5 text-gold shrink-0" />
                                                        {item.total_guests} Orang ({item.days} Malam)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subtotal tag */}
                                        <div className="absolute bottom-5 right-5 font-outfit font-extrabold text-gold text-lg">
                                            Rp {item.price_subtotal.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Checkout panel (Right) */}
                        <div className="bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 text-left">
                            <div className="border-b border-neutral-100 dark:border-white/5 pb-4">
                                <span className="text-xs text-neutral-500 dark:text-white/50">Simultaneous Checkout</span>
                                <h3 className="font-outfit text-lg font-bold text-neutral-900 dark:text-white mt-1">Pembayaran Sekaligus</h3>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-6">
                                {/* Guest details form (if not authenticated or as verification) */}
                                <div className="space-y-3.5">
                                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Informasi Kontak Pemesan</h4>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/40">Nama Lengkap</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={checkoutForm.data.name}
                                            onChange={(e) => checkoutForm.setData('name', e.target.value)}
                                            className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 px-4 py-3 rounded-xl text-xs text-neutral-800 dark:text-white focus:border-gold focus:outline-none"
                                            placeholder="Masukkan nama Anda"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/40">Alamat Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={checkoutForm.data.email}
                                            onChange={(e) => checkoutForm.setData('email', e.target.value)}
                                            className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 px-4 py-3 rounded-xl text-xs text-neutral-800 dark:text-white focus:border-gold focus:outline-none"
                                            placeholder="nama@email.com"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/40">Nomor WhatsApp</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={checkoutForm.data.phone}
                                            onChange={(e) => checkoutForm.setData('phone', e.target.value)}
                                            className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 px-4 py-3 rounded-xl text-xs text-neutral-800 dark:text-white focus:border-gold focus:outline-none"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                </div>

                                {/* Payment Methods selection */}
                                <div className="space-y-3.5 pt-2">
                                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Metode Pembayaran Transfer</h4>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {paymentMethods.map((method) => (
                                            <div 
                                                key={method.id}
                                                onClick={() => setSelectedPayment(method.id)}
                                                className={`border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 ${
                                                    selectedPayment === method.id 
                                                        ? 'bg-gold/10 border-gold/60 text-white' 
                                                        : 'bg-neutral-50 dark:bg-black/20 border-neutral-200 dark:border-white/5 hover:border-gold/30'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                                                        <CreditCard className="h-4 w-4" />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block text-xs font-bold text-neutral-900 dark:text-white leading-tight">{method.name}</span>
                                                        <span className="text-[10px] text-neutral-500 dark:text-white/40">{method.type === 'qris' ? 'Scan Instant QRIS' : 'Virtual Account Transfer'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active payment details warning card */}
                                {activePaymentMethod && (
                                    <div className="bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-white/5 p-4.5 rounded-2xl space-y-2 text-xs leading-relaxed">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Penerima</span>
                                            <span className="font-bold text-neutral-800 dark:text-white">{activePaymentMethod.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">No. Rekening</span>
                                            <span className="font-bold text-gold tracking-wide">{activePaymentMethod.account_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Atas Nama</span>
                                            <span className="font-bold text-neutral-800 dark:text-white">{activePaymentMethod.account_name}</span>
                                        </div>
                                        {activePaymentMethod.qris_image_path && (
                                            <div className="flex flex-col items-center pt-2">
                                                <span className="text-[9px] text-neutral-400 mb-1">Scan barcode QRIS di bawah</span>
                                                <img src={activePaymentMethod.qris_image_path} alt="QRIS" className="h-28 w-28 object-contain bg-white p-2 rounded-xl" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bill invoice total */}
                                <div className="border-t border-neutral-100 dark:border-white/5 pt-4 space-y-3">
                                    <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-white/50">
                                        <span>Total Kamar</span>
                                        <span>{cartItems.length} Kamar</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-neutral-800 dark:text-white">Total Pembayaran</span>
                                        <span className="font-outfit font-extrabold text-gold text-2xl">Rp {totalBill.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={checkoutForm.processing}
                                    className="w-full bg-gold text-deep-black font-extrabold text-xs py-4.5 rounded-2xl transition-all hover:bg-white active:scale-95 flex items-center justify-center space-x-2 cursor-pointer shadow-xl shadow-gold/10"
                                >
                                    <span>Konfirmasi & Bayar Sekarang</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </LuxuryLayout>
    );
}
