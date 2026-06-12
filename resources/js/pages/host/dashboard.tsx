import { Head, router } from '@inertiajs/react';
import { 
    LayoutGrid, 
    DollarSign, 
    Hotel, 
    Users, 
    Clock, 
    Check, 
    X, 
    PhoneCall, 
    Image, 
    Eye, 
    Calendar,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    total_price: number;
    payment_receipt_path?: string;
    status: string;
    guest: {
        name: string;
        phone: string;
        email: string;
    };
    homestay: {
        id: number;
        name: string;
    };
    paymentMethod?: {
        name: string;
        type: string;
    };
}

interface HostDashboardProps {
    listingsCount: number;
    earnings: number;
    pendingApprovals: Booking[];
    activeStays: Booking[];
}

export default function HostDashboard({ listingsCount, earnings, pendingApprovals = [], activeStays = [] }: HostDashboardProps) {
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

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openReceiptModal, setOpenReceiptModal] = useState(false);
    const [openApproveModal, setOpenApproveModal] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [actionProcessing, setActionProcessing] = useState(false);

    const getWhatsAppUrl = (phone: string, guestName: string, homestayName: string) => {
        const cleanedPhone = phone.replace(/^0/, '62');
        const text = encodeURIComponent(
            `Halo Kak ${guestName}, saya Host dari penginapan ${homestayName}. Terkait pemesanan Anda...`
        );

        return `https://wa.me/${cleanedPhone}?text=${text}`;
    };

    const handleApprove = () => {
        if (!selectedBooking) {
return;
}

        setActionProcessing(true);
        router.post(route('host.reservations.approve', { id: selectedBooking.id }), {}, {
            onSuccess: () => {
                toast.success('Bukti bayar disetujui! Status booking dikonfirmasi.');
                setOpenApproveModal(false);
                setActionProcessing(false);
            },
            onError: () => {
                toast.error('Gagal memverifikasi pemesanan.');
                setActionProcessing(false);
            }
        });
    };

    const handleReject = () => {
        if (!selectedBooking) {
return;
}

        setActionProcessing(true);
        router.post(route('host.reservations.reject', { id: selectedBooking.id }), {}, {
            onSuccess: () => {
                toast.success('Bukti transfer ditolak. Pesanan tamu telah dibatalkan.');
                setOpenRejectModal(false);
                setActionProcessing(false);
            },
            onError: () => {
                toast.error('Gagal menolak pemesanan.');
                setActionProcessing(false);
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Dashboard Host" />

            {/* Title Header */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Pemilik</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Ringkasan Statistik Host</h1>
                <p className="text-sm text-muted-foreground">Monitor pemesanan masuk, tamu aktif, total pendapatan homestay, dan persetujuan bayar.</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-gold/5 blur-[50px] pointer-events-none"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pendapatan</CardTitle>
                        <DollarSign className="h-4 w-4 text-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-outfit text-gold">Rp {earnings.toLocaleString('id-ID')}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Akumulasi sewa kamar yang terverifikasi disetujui.</p>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/5 blur-[50px] pointer-events-none"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Listing Homestay</CardTitle>
                        <Hotel className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-outfit text-white">{listingsCount} Kamar</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Jumlah kamar terdaftar milik Anda.</p>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 bg-[#0f0f0f] relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tamu Aktif Saat Ini</CardTitle>
                        <Users className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-outfit text-white">{activeStays.length} Orang</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Jumlah reservasi terkonfirmasi yang sedang stay hari ini.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Pending Approvals Panel */}
                <div className="space-y-4">
                    <h3 className="font-outfit text-lg font-bold flex items-center gap-2">
                        <Clock className="text-yellow-500 h-5 w-5 animate-pulse" />
                        Persetujuan Bukti Transfer ({pendingApprovals.length})
                    </h3>

                    {pendingApprovals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5 space-y-3">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                            <h4 className="text-xs font-bold text-white">Tidak Ada Permintaan</h4>
                            <p className="text-[10px] text-muted-foreground max-w-xs">Pemesanan baru yang memerlukan verifikasi manual bukti transfer akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingApprovals.map((booking) => (
                                <Card key={booking.id} className="border border-white/5 bg-[#0f0f0f] p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white text-xs">{booking.guest.name}</h4>
                                            <p className="text-[10px] text-muted-foreground">{booking.homestay.name}</p>
                                            <p className="text-[9px] text-gold font-bold">Instansi: {booking.paymentMethod?.name || 'Manual Transfer'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-extrabold text-gold block font-outfit">Rp {booking.total_price.toLocaleString('id-ID')}</span>
                                            <span className="text-[9px] text-muted-foreground block">{booking.total_guests} Tamu</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] border-y border-white/5 py-3 text-muted-foreground">
                                        <div>Check-in: <strong className="text-white font-bold">{formatDate(booking.check_in)}</strong></div>
                                        <div>Check-out: <strong className="text-white font-bold">{formatDate(booking.check_out)}</strong></div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {booking.payment_receipt_path ? (
                                            <Button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setOpenReceiptModal(true);
                                                }}
                                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold py-2 rounded-xl flex-1 flex gap-1 items-center justify-center"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Lihat Bukti
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled
                                                className="bg-yellow-500/10 text-yellow-500 text-[9px] font-semibold py-2 rounded-xl flex-1 cursor-not-allowed"
                                            >
                                                Belum Upload Bukti
                                            </Button>
                                        )}

                                        <a
                                            href={getWhatsAppUrl(booking.guest.phone, booking.guest.name, booking.homestay.name)}
                                            target="_blank"
                                            className="border border-white/10 hover:border-gold text-white font-bold text-[10px] py-2 rounded-xl flex-1 flex gap-1 items-center justify-center transition-colors"
                                        >
                                            <PhoneCall className="h-3.5 w-3.5 text-gold" /> Hubungi
                                        </a>

                                        {booking.payment_receipt_path && (
                                            <>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setOpenApproveModal(true);
                                                    }}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2 h-9 w-9 rounded-xl shrink-0"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setOpenRejectModal(true);
                                                    }}
                                                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold p-2 h-9 w-9 rounded-xl shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Active Stays Panel */}
                <div className="space-y-4">
                    <h3 className="font-outfit text-lg font-bold flex items-center gap-2">
                        <Users className="text-emerald-400 h-5 w-5" />
                        Tamu Sedang Menginap ({activeStays.length})
                    </h3>

                    {activeStays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5 space-y-3">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <h4 className="text-xs font-bold text-white">Kosong Hari Ini</h4>
                            <p className="text-[10px] text-muted-foreground max-w-xs font-sans">Reservasi terkonfirmasi yang menginap hari ini di kamar Lhokseumawe Anda akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeStays.map((booking) => (
                                <Card key={booking.id} className="border border-white/5 bg-[#0f0f0f] p-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-left">
                                            <h4 className="font-bold text-white text-xs">{booking.guest.name}</h4>
                                            <p className="text-[10px] text-muted-foreground">{booking.homestay.name}</p>
                                        </div>
                                        <a
                                            href={getWhatsAppUrl(booking.guest.phone, booking.guest.name, booking.homestay.name)}
                                            target="_blank"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-black transition-colors"
                                        >
                                            <PhoneCall className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
                                        <span>Check-in: <strong className="text-white font-bold">{formatDate(booking.check_in)}</strong></span>
                                        <span>Check-out: <strong className="text-white font-bold">{formatDate(booking.check_out)}</strong></span>
                                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 uppercase tracking-widest text-[8px]">In Stay</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 1. MODAL: VIEW TRANSFER RECEIPT IMAGE */}
            <Dialog open={openReceiptModal} onOpenChange={setOpenReceiptModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-lg rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Image className="text-gold h-5 w-5" />
                            Bukti Transfer Tamu
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2">
                            Milik Tamu: <strong>{selectedBooking?.guest.name}</strong> untuk Homestay <strong>{selectedBooking?.homestay.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking?.payment_receipt_path && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 max-h-96 flex items-center justify-center bg-black/40">
                            <img
                                src={selectedBooking.payment_receipt_path}
                                alt="Bukti Transfer"
                                className="object-contain max-h-96 w-full"
                            />
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-4 border-t border-white/5 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpenReceiptModal(false)}
                            className="bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold px-6"
                        >
                            Tutup
                        </Button>
                        <Button
                            onClick={() => {
                                setOpenReceiptModal(false);
                                setOpenApproveModal(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            Setujui Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. MODAL: CONFIRM APPROVAL (LUXURIOUS BUBBLE GLOW) */}
            <Dialog open={openApproveModal} onOpenChange={setOpenApproveModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-pulse">
                        <Check className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Setujui Bukti Transfer?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin telah menerima dana masuk senilai <strong className="text-gold">Rp {selectedBooking?.total_price.toLocaleString('id-ID')}</strong> dari tamu <strong>{selectedBooking?.guest.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenApproveModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                            disabled={actionProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={actionProcessing}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            {actionProcessing ? 'Memproses...' : 'Ya, Setujui'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 3. MODAL: CONFIRM REJECTION */}
            <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 animate-bounce">
                        <AlertCircle className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Tolak Bukti Transfer?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Aksi ini akan menolak berkas bukti transfer dan merubah status booking menjadi <strong className="text-rose-400">Dibatalkan</strong>. Tamu harus mengunggah berkas bayar baru kembali.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenRejectModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                            disabled={actionProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={actionProcessing}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            {actionProcessing ? 'Memproses...' : 'Ya, Tolak'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
