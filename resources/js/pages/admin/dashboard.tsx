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
}

export default function AdminDashboard({ 
    totalUsers, 
    totalHosts, 
    totalGuests, 
    totalListings, 
    totalRevenue, 
    recentBookings = [] 
}: AdminDashboardProps) {

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
                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pendapatan</CardTitle>
                        <DollarSign className="h-4 w-4 text-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit text-gold">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Platform-wide stay booking revenue.</p>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengguna</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit text-white">{totalUsers} Akun</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Hosts: {totalHosts} | Tamu: {totalGuests}</p>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Listing Aktif</CardTitle>
                        <Home className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit text-white">{totalListings} Kamar</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Properti homestay terdaftar.</p>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Akses Admin</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold font-outfit text-rose-400">Super Admin</div>
                        <p className="text-[9px] text-muted-foreground mt-1">Hak akses kontrol penuh aktif.</p>
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
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5 space-y-3">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                        <h4 className="text-xs font-bold text-white">Belum Ada Transaksi</h4>
                        <p className="text-[10px] text-muted-foreground">Seluruh log pemesanan tamu di website homestay akan tercatat di sini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f0f0f]">
                        <table className="w-full text-xs text-left text-white/70">
                            <thead className="text-[10px] text-white/40 uppercase bg-black/40 border-b border-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Nama Tamu & Akomodasi</th>
                                    <th scope="col" className="px-6 py-4">Masa Stay</th>
                                    <th scope="col" className="px-6 py-4">Total Biaya</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">
                                            <div>{booking.guest.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-normal">{booking.homestay.name}</div>
                                        </td>
                                        <td className="px-6 py-4 font-sans">
                                            {new Date(booking.check_in).toLocaleDateString('id-ID', { dateStyle: 'short' })} s/d {new Date(booking.check_out).toLocaleDateString('id-ID', { dateStyle: 'short' })}
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
