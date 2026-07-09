import { Head, Link, router } from '@inertiajs/react';
import { 
    Calendar, 
    CreditCard, 
    MessageSquare, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    XCircle, 
    MapPin, 
    Users, 
    Compass,
    AlertOctagon,
    HelpCircle,
    ArrowRight,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface Homestay {
    name: string;
    city: string;
    address: string;
    media: Array<{ file_path: string; is_primary: boolean }>;
}

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    total_price: number;
    status: string;
    homestay: Homestay;
}

interface GuestDashboardProps {
    totalBookings: number;
    activeStaysCount: number;
    pendingPaymentsCount: number;
    latestStay: Booking | null;
    needsPasswordChange: boolean;
}

export default function GuestDashboard({ 
    totalBookings = 0, 
    activeStaysCount = 0, 
    pendingPaymentsCount = 0, 
    latestStay = null, 
    needsPasswordChange 
}: GuestDashboardProps) {

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment':
                return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-500"><Clock className="h-3 w-3" /> Menunggu Bayar</span>;
            case 'pending_approval':
                return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400"><Clock className="h-3 w-3" /> Menunggu Approval</span>;
            case 'confirmed':
                return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400"><CheckCircle className="h-3 w-3" /> Dikonfirmasi</span>;
            case 'completed':
                return <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white/70"><CheckCircle className="h-3 w-3" /> Selesai Stay</span>;
            default:
                return <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-400"><XCircle className="h-3 w-3" /> Dibatalkan</span>;
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
            <Head title="Dashboard Tamu" />

            {/* Title Block */}
            <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Tamu</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Ringkasan Dasbor Anda</h1>
                <p className="text-sm text-muted-foreground">Info ringkas reservasi penginapan dan jalan pintas akses layanan Anda.</p>
            </div>

            {/* Password Warning Banner */}
            {needsPasswordChange && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 text-left">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-white text-sm">Peringatan Keamanan Akun</h4>
                            <p className="text-xs text-muted-foreground mt-1">Anda saat ini masuk menggunakan password sementara otomatis. Harap segera ubah password Anda demi keamanan.</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => router.get(route('profile.edit'))} 
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-full shrink-0"
                    >
                        Ubah Password Sekarang
                    </Button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-white/5 bg-[#0f0f0f]/60 text-left">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider text-white/40">Total Pemesanan</CardDescription>
                        <CardTitle className="font-outfit text-3xl font-black text-white">{totalBookings}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">Homestay yang telah Anda pesan.</p>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 bg-[#0f0f0f]/60 text-left">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider text-white/40">Masa Sewa Aktif</CardDescription>
                        <CardTitle className="font-outfit text-3xl font-black text-emerald-400">{activeStaysCount}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">Kamar yang sedang aktif Anda gunakan saat ini.</p>
                    </CardContent>
                </Card>

                <Card className={`border text-left ${pendingPaymentsCount > 0 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5 bg-[#0f0f0f]/60'}`}>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider text-white/40">Menunggu Pembayaran</CardDescription>
                        <CardTitle className={`font-outfit text-3xl font-black ${pendingPaymentsCount > 0 ? 'text-yellow-500' : 'text-white'}`}>{pendingPaymentsCount}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">Tagihan transaksi yang perlu segera Anda selesaikan.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Latest Booking Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Quick Actions Grid */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="font-outfit text-lg font-bold text-left text-white">Jalan Pintas Cepat</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <Link href="/explore" className="group">
                            <Card className="border border-white/5 bg-[#0f0f0f] hover:border-gold/30 hover:bg-black/60 transition-all p-5 text-left h-full flex flex-col justify-between">
                                <CardHeader className="p-0 space-y-3">
                                    <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-105 transition-all">
                                        <Compass className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-white group-hover:text-gold transition-colors">Cari Kamar</CardTitle>
                                        <CardDescription className="text-[11px] mt-1">Cari dan booking homestay premium berikutnya.</CardDescription>
                                    </div>
                                </CardHeader>
                                <span className="text-[10px] text-gold font-bold flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-all">
                                    Mulai Jelajah <ArrowRight className="h-3 w-3" />
                                </span>
                            </Card>
                        </Link>

                        <Link href="/guest/bookings" className="group">
                            <Card className="border border-white/5 bg-[#0f0f0f] hover:border-gold/30 hover:bg-black/60 transition-all p-5 text-left h-full flex flex-col justify-between">
                                <CardHeader className="p-0 space-y-3">
                                    <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-105 transition-all">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-white group-hover:text-gold transition-colors">Pesanan Saya</CardTitle>
                                        <CardDescription className="text-[11px] mt-1">Lihat riwayat pemesanan & unggah bukti transfer.</CardDescription>
                                    </div>
                                </CardHeader>
                                <span className="text-[10px] text-gold font-bold flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-all">
                                    Buka Pesanan <ArrowRight className="h-3 w-3" />
                                </span>
                            </Card>
                        </Link>

                        <Link href="/guest/complaints" className="group">
                            <Card className="border border-white/5 bg-[#0f0f0f] hover:border-gold/30 hover:bg-black/60 transition-all p-5 text-left h-full flex flex-col justify-between">
                                <CardHeader className="p-0 space-y-3">
                                    <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-105 transition-all">
                                        <AlertOctagon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-white group-hover:text-gold transition-colors">Keluhan Saya</CardTitle>
                                        <CardDescription className="text-[11px] mt-1">Laporkan kendala ruangan langsung ke pemilik stay.</CardDescription>
                                    </div>
                                </CardHeader>
                                <span className="text-[10px] text-gold font-bold flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-all">
                                    Kirim Aduan <ArrowRight className="h-3 w-3" />
                                </span>
                            </Card>
                        </Link>

                        <Link href="/help" className="group">
                            <Card className="border border-white/5 bg-[#0f0f0f] hover:border-gold/30 hover:bg-black/60 transition-all p-5 text-left h-full flex flex-col justify-between">
                                <CardHeader className="p-0 space-y-3">
                                    <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-105 transition-all">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-white group-hover:text-gold transition-colors">Pusat Bantuan</CardTitle>
                                        <CardDescription className="text-[11px] mt-1">Panduan pemesanan dan bantuan dari admin.</CardDescription>
                                    </div>
                                </CardHeader>
                                <span className="text-[10px] text-gold font-bold flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-all">
                                    Tanya Bantuan <ArrowRight className="h-3 w-3" />
                                </span>
                            </Card>
                        </Link>

                    </div>
                </div>

                {/* Right: Latest Active / Upcoming Stay Card */}
                <div className="lg:col-span-5 space-y-6">
                    <h3 className="font-outfit text-lg font-bold text-left text-white">Akses Cepat Reservasi Terkini</h3>
                    
                    {latestStay ? (
                        <Card className="overflow-hidden border border-white/5 bg-[#0f0f0f] flex flex-col text-left">
                            <div className="relative aspect-video w-full overflow-hidden bg-white/5 shrink-0">
                                <img 
                                    src={latestStay.homestay.media.find(m => m.is_primary)?.file_path || latestStay.homestay.media[0]?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'} 
                                    alt={latestStay.homestay.name}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(latestStay.status)}
                                </div>
                            </div>
                            <CardHeader className="p-5 pb-3">
                                <CardTitle className="font-outfit text-base font-bold text-white truncate">{latestStay.homestay.name}</CardTitle>
                                <CardDescription className="flex items-center text-[10px] text-gold font-bold">
                                    <MapPin className="h-3 w-3 mr-0.5 shrink-0" />
                                    {latestStay.homestay.city}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-5 pb-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground border-y border-white/5 py-3">
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-white/30">Check-in</span>
                                        <span className="font-bold text-white block mt-0.5">{formatDate(latestStay.check_in)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-white/30">Check-out</span>
                                        <span className="font-bold text-white block mt-0.5">{formatDate(latestStay.check_out)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="px-5 pb-5 pt-0">
                                <Button 
                                    onClick={() => router.get(`/bookings/${latestStay.id}/success`)}
                                    className="w-full bg-gold hover:bg-white text-black font-bold text-xs py-4.5 rounded-xl flex items-center justify-center gap-1.5"
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    Lihat E-Receipt Detail
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-[#0f0f0f]/40">
                            <Calendar className="h-9 w-9 text-white/20 animate-pulse" />
                            <p className="text-xs text-muted-foreground max-w-xs px-4">Tidak ada reservasi aktif atau pending. Temukan staycation impian Anda sekarang!</p>
                            <Button 
                                onClick={() => router.get('/explore')} 
                                className="bg-white hover:bg-gold text-black font-bold text-[10px] px-4 py-2 rounded-full"
                            >
                                Cari Homestay
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
