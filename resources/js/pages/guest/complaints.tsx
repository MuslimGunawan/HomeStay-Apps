import { Head, useForm } from '@inertiajs/react';
import { 
    AlertOctagon, 
    Clock, 
    CheckCircle, 
    Send, 
    Calendar,
    MessageSquare,
    Home,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Homestay {
    name: string;
}

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    homestay: Homestay;
}

interface Complaint {
    id: number;
    booking_id: number;
    message: string;
    status: 'pending' | 'resolved';
    created_at: string;
    homestay: Homestay;
    booking: {
        check_in: string;
        check_out: string;
    };
}

interface ComplaintsProps {
    complaints: Complaint[];
    activeStays: Booking[];
}

export default function GuestComplaints({ complaints = [], activeStays = [] }: ComplaintsProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        booking_id: activeStays.length > 0 ? String(activeStays[0].id) : '',
        message: '',
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.booking_id) {
            toast.error('Silakan pilih homestay yang ingin dilaporkan.');
            return;
        }

        if (!data.message.trim()) {
            toast.error('Silakan isi rincian aduan keluhan Anda.');
            return;
        }

        post(route('guest.complaints.store'), {
            onSuccess: () => {
                toast.success('Keluhan Anda berhasil dikirim ke Host. Stay manager akan segera merespons.');
                reset('message');
            },
            onError: () => {
                toast.error('Gagal mengirim aduan keluhan.');
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
            <Head title="Keluhan Tamu" />

            {/* Title Block */}
            <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Tamu</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Laporan Keluhan</h1>
                <p className="text-sm text-muted-foreground">Laporkan kendala fasilitas homestay Anda selama masa sewa aktif secara langsung kepada pengelola.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Keluhan Baru */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border border-white/5 bg-[#0f0f0f] text-left">
                        <CardHeader>
                            <CardTitle className="font-outfit text-lg font-bold text-white flex items-center gap-2">
                                <AlertOctagon className="h-5 w-5 text-rose-500" />
                                Kirim Aduan Baru
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Masalah AC, air, internet, atau kebersihan? Tulis di sini agar cepat ditangani oleh Host.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeStays.length === 0 ? (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
                                    <div className="flex gap-2 text-amber-500">
                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span className="text-xs font-bold font-outfit uppercase">Tidak Ada Sewa Aktif</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Aduan keluhan hanya dapat dikirimkan jika Anda memiliki reservasi penginapan yang sedang aktif dan berstatus <strong>Dikonfirmasi</strong> saat ini.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="booking_id" className="text-xs text-white/70">Pilih Homestay Aktif</Label>
                                        <select
                                            id="booking_id"
                                            value={data.booking_id}
                                            onChange={(e) => setData('booking_id', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none cursor-pointer"
                                        >
                                            {activeStays.map((stay) => (
                                                <option key={stay.id} value={stay.id} className="bg-[#111111] text-white">
                                                    {stay.homestay.name} ({formatDate(stay.check_in)} - {formatDate(stay.check_out)})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.booking_id && (
                                            <span className="text-[10px] text-red-400 block">{errors.booking_id}</span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-xs text-white/70">Isi Keluhan / Masalah</Label>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            placeholder="Jelaskan kendala secara rinci, misalnya: AC di kamar utama tidak dingin, atau WiFi tidak bisa terkoneksi..."
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                                        ></textarea>
                                        {errors.message && (
                                            <span className="text-[10px] text-red-400 block">{errors.message}</span>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing || !data.message.trim()}
                                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/40 text-white font-bold text-xs py-5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Kirim Aduan Keluhan</span>
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Daftar Keluhan Sebelumnya */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="font-outfit text-xl font-bold text-left">Riwayat Aduan Keluhan</h3>

                    {complaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                            <MessageSquare className="h-10 w-10 text-rose-500/30 animate-pulse" />
                            <h4 className="font-bold text-white">Tidak Ada Riwayat Keluhan</h4>
                            <p className="text-xs text-muted-foreground max-w-xs">Hebat! Anda tidak memiliki catatan keluhan atau aduan aktif pada sistem kami.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map((complaint) => (
                                <Card key={complaint.id} className="border border-white/5 bg-[#0f0f0f] text-left p-6 space-y-4">
                                    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                                        <div className="space-y-1">
                                            <h4 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                                                <Home className="h-4 w-4 text-gold shrink-0" />
                                                {complaint.homestay.name}
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Masa Stay: {formatDate(complaint.booking.check_in)} - {formatDate(complaint.booking.check_out)}
                                            </span>
                                        </div>
                                        
                                        <div>
                                            {complaint.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Resolved
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Laporan Aduan</span>
                                        <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-4 border border-white/5 rounded-2xl italic">
                                            "{complaint.message}"
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                                        <span>Dikirim: {formatDate(complaint.created_at)}</span>
                                        {complaint.status === 'resolved' && (
                                            <span className="text-emerald-400/80 font-bold">Telah ditangani oleh pemilik Homestay</span>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
