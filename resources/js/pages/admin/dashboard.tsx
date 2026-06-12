import { Head } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    Home, 
    DollarSign, 
    Clock, 
    ArrowRight,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    total_price: number;
    status: string;
    guest: {
        name: string;
        email: string;
    };
    homestay: {
        name: string;
    };
}

interface AdminDashboardProps {
    totalUsers: number;
    totalHosts: number;
    totalGuests: number;
    totalListings: number;
    totalRevenue: number;
    recentBookings: Booking[];
    roomStats: {
        ready: number;
        tersewa: number;
        tutup: number;
    };
    pendingSupportCount: number;
    pendingComplaintCount: number;
}

export default function AdminDashboard({ 
    totalUsers, 
    totalHosts, 
    totalGuests, 
    totalListings, 
    totalRevenue, 
    recentBookings = [],
    roomStats = { ready: 0, tersewa: 0, tutup: 0 },
    pendingSupportCount = 0,
    pendingComplaintCount = 0
}: AdminDashboardProps) {

    const formatDate = (dateString: string) => {
        if (!dateString) {
return '-';
}

        const d = new Date(dateString);

        if (isNaN(d.getTime())) {
return dateString;
}

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending_payment': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'pending_approval': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'confirmed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'completed': return 'bg-white/10 text-white/50 border border-white/10';
            default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending_payment': return 'Menunggu Bayar';
            case 'pending_approval': return 'Verifikasi Bukti';
            case 'confirmed': return 'Dikonfirmasi';
            case 'completed': return 'Selesai';
            default: return 'Dibatalkan';
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Dashboard Super Admin" />

            {/* Header */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Administrator</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Ringkasan Sistem Homestay</h1>
                <p className="text-sm text-muted-foreground">Monitor pertumbuhan platform, listing homestay, dan aktivitas transaksi.</p>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-black/5 dark:border-white/5 bg-card text-foreground relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pendapatan</CardTitle>
                        <DollarSign className="h-4 w-4 text-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit text-gold">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Akumulasi pendapatan sewa terkonfirmasi.</p>
                    </CardContent>
                </Card>

                <Card className="border border-black/5 dark:border-white/5 bg-card text-foreground relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengguna</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit">{totalUsers} Akun</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Host: {totalHosts} | Tamu: {totalGuests}</p>
                    </CardContent>
                </Card>

                <Card className="border border-black/5 dark:border-white/5 bg-card text-foreground relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Listing Kamar</CardTitle>
                        <Home className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit">{totalListings} Kamar</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Seluruh tipe kamar terdaftar di sistem.</p>
                    </CardContent>
                </Card>

                <Card className="border border-black/5 dark:border-white/5 bg-card text-foreground relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Akses</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit text-rose-500">Super Admin</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Kontrol panel administratif penuh.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Extended Status & Alerts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Occupancy Stats Card */}
                <Card className="border border-black/5 dark:border-white/5 bg-card text-foreground">
                    <CardHeader>
                        <CardTitle className="font-outfit text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            Status Akomodasi & Kamar
                            <Home className="h-4 w-4 text-gold" />
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Proporsi ketersediaan real-time seluruh kamar Yuri Homestay.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                                <span className="text-2xl font-extrabold font-outfit block">{roomStats.ready}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider block">Ready / Aktif</span>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                <span className="text-2xl font-extrabold font-outfit block">{roomStats.tersewa}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider block">Tersewa</span>
                            </div>
                            <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-rose-500 dark:text-rose-400">
                                <span className="text-2xl font-extrabold font-outfit block">{roomStats.tutup}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider block">Tutup / Nonaktif</span>
                            </div>
                        </div>

                        {/* Visual progress bar representation */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                <span>Rasio Kamar Tersewa (Okupansi)</span>
                                <span>{totalListings > 0 ? Math.round((roomStats.tersewa / totalListings) * 100) : 0}% Terisi</span>
                            </div>
                            <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                                {totalListings > 0 ? (
                                    <>
                                        <div style={{ width: `${(roomStats.tersewa / totalListings) * 100}%` }} className="bg-amber-500 h-full" title="Tersewa" />
                                        <div style={{ width: `${(roomStats.ready / totalListings) * 100}%` }} className="bg-emerald-500 h-full" title="Ready" />
                                        <div style={{ width: `${(roomStats.tutup / totalListings) * 100}%` }} className="bg-rose-500 h-full" title="Tutup" />
                                    </>
                                ) : (
                                    <div className="w-full bg-neutral-300 dark:bg-neutral-700 h-full" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Operations & Support Tickets Card */}
                <Card className="border border-black/5 dark:border-white/5 bg-card text-foreground">
                    <CardHeader>
                        <CardTitle className="font-outfit text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            Aktivitas Operasional
                            <ShieldAlert className="h-4 w-4 text-rose-400" />
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Antrian tiket bantuan pelanggan dan komplain aktif saat ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <div>
                                <span className="block font-bold text-xs">Keluhan Tamu Aktif</span>
                                <span className="text-[10px] text-muted-foreground">Komplain stay aktif yang belum diselesaikan.</span>
                            </div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold font-outfit text-sm ${
                                pendingComplaintCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}>
                                {pendingComplaintCount}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <div>
                                <span className="block font-bold text-xs">Tiket Bantuan Baru</span>
                                <span className="text-[10px] text-muted-foreground">Pesan Help Center masuk berstatus pending.</span>
                            </div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold font-outfit text-sm ${
                                pendingSupportCount > 0 ? 'bg-blue-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}>
                                {pendingSupportCount}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-outfit text-lg font-bold flex items-center gap-2">
                        <Clock className="text-gold h-5 w-5" />
                        Transaksi Pemesanan Terbaru
                    </h3>
                </div>

                {recentBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                        <h4 className="text-xs font-bold text-foreground">Belum Ada Transaksi</h4>
                        <p className="text-[10px] text-muted-foreground">Seluruh log pemesanan tamu di website homestay akan tercatat di sini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                        <table className="w-full text-xs text-left text-foreground">
                            <thead className="text-[10px] text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Nama Tamu & Akomodasi</th>
                                    <th scope="col" className="px-6 py-4">Masa Stay</th>
                                    <th scope="col" className="px-6 py-4">Total Biaya</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-foreground">
                                            <div>{booking.guest.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-normal">{booking.homestay.name}</div>
                                        </td>
                                        <td className="px-6 py-4 font-sans text-muted-foreground">
                                            {formatDate(booking.check_in)} s/d {formatDate(booking.check_out)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gold">
                                            Rp {booking.total_price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
