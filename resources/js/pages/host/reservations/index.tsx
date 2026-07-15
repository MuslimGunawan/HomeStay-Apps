import { Head, router, usePage } from '@inertiajs/react';
import { 
    CalendarCheck, 
    Clock, 
    Check, 
    X, 
    PhoneCall, 
    Eye, 
    AlertCircle,
    User,
    CheckCircle,
    XCircle,
    Search
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

interface ReservationsProps {
    bookings: Booking[];
}

export default function Reservations({ bookings = [] }: ReservationsProps) {
    const { auth } = usePage().props as any;
    const prefix = auth?.user?.role === 'admin' ? 'admin' : 'host';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openReceiptModal, setOpenReceiptModal] = useState(false);
    const [openApproveModal, setOpenApproveModal] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [openCompleteModal, setOpenCompleteModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [extendDate, setExtendDate] = useState('');
    const [actionProcessing, setActionProcessing] = useState(false);

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
        router.post(route(`${prefix}.reservations.approve` as any, { id: selectedBooking.id }), {}, {
            onSuccess: () => {
                toast.success('Pemesanan tamu disetujui secara resmi.');
                setOpenApproveModal(false);
                setActionProcessing(false);
            },
            onError: () => {
                toast.error('Gagal menyetujui pemesanan.');
                setActionProcessing(false);
            }
        });
    };

    const handleReject = () => {
        if (!selectedBooking) {
            return;
        }

        setActionProcessing(true);
        router.post(route(`${prefix}.reservations.reject` as any, { id: selectedBooking.id }), {}, {
            onSuccess: () => {
                toast.success('Bukti bayar ditolak dan pesanan telah dibatalkan.');
                setOpenRejectModal(false);
                setActionProcessing(false);
            },
            onError: () => {
                toast.error('Gagal menolak pemesanan.');
                setActionProcessing(false);
            }
        });
    };

    const handleComplete = () => {
        if (!selectedBooking) {
            return;
        }

        setActionProcessing(true);
        router.post(route(`${prefix}.reservations.complete` as any, { id: selectedBooking.id }), {}, {
            onSuccess: (page) => {
                toast.success('Reservasi tamu berhasil diselesaikan (Check-out).');
                setOpenCompleteModal(false);
                setActionProcessing(false);

                // Check if there is a WhatsApp URL in the flash session data
                const flash = page.props.flash as any;
                if (flash?.checkout_notification?.whatsapp_url) {
                    // Open WhatsApp in a new tab to send notification
                    window.open(flash.checkout_notification.whatsapp_url, '_blank');
                    toast.success('Membuka WhatsApp untuk mengirim notifikasi check-out kepada tamu...');
                }
            },
            onError: () => {
                toast.error('Gagal menyelesaikan reservasi.');
                setActionProcessing(false);
            }
        });
    };

    const handleExtend = () => {
        if (!selectedBooking || !extendDate) {
            toast.error('Silakan pilih tanggal check-out baru.');

            return;
        }

        setActionProcessing(true);
        router.post(route(`${prefix}.reservations.extend` as any, { id: selectedBooking.id }), {
            check_out: extendDate
        }, {
            onSuccess: () => {
                toast.success('Masa tinggal tamu berhasil diperpanjang.');
                setOpenDetailModal(false);
                setActionProcessing(false);
                setExtendDate('');
            },
            onError: (errors) => {
                const errMsg = errors.check_out || 'Gagal memperpanjang masa tinggal.';
                toast.error(errMsg);
                setActionProcessing(false);
            }
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending_payment': return 'Menunggu Bayar';
            case 'pending_approval': return 'Persetujuan Manual';
            case 'confirmed': return 'Terkonfirmasi';
            case 'completed': return 'Selesai';
            default: return 'Dibatalkan';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending_payment': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'pending_approval': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'confirmed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'completed': return 'bg-white/10 text-white/60 border border-white/10';
            default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        }
    };

    const filteredBookings = bookings.filter(b => 
        b.guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.homestay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Manajemen Reservasi" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">
                        {auth?.user?.role === 'admin' ? 'Portal Administrator' : 'Portal Pemilik'}
                    </span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Manajemen Reservasi Masuk</h1>
                    <p className="text-sm text-muted-foreground">Audit seluruh data booking tamu, approval manual transfer bank, atau hubungi tamu.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input 
                        placeholder="Cari nama tamu, kamar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-white/20 focus:border-gold"
                    />
                </div>
            </div>

            {/* Table or Grid */}
            {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <CalendarCheck className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Tidak Ada Data Reservasi</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">Data pemesanan stay oleh tamu akan muncul di sini untuk dikelola.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f0f0f]">
                    <table className="w-full text-xs text-left text-white/70">
                        <thead className="text-[10px] text-white/40 uppercase bg-black/40 border-b border-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4">Tamu</th>
                                <th scope="col" className="px-6 py-4">Kamar</th>
                                <th scope="col" className="px-6 py-4">Masa Menginap</th>
                                <th scope="col" className="px-6 py-4">Metode Bayar</th>
                                <th scope="col" className="px-6 py-4">Total Biaya</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <span className="block">{booking.guest.name}</span>
                                                <span className="block text-[10px] text-muted-foreground font-normal">{booking.guest.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        {booking.homestay.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="block font-semibold">{formatDate(booking.check_in)} s/d</span>
                                        <span className="block text-[10px] text-muted-foreground">{formatDate(booking.check_out)}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gold">
                                        {booking.paymentMethod?.name || 'Manual Bank'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        Rp {booking.total_price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Details Button */}
                                            <Button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setExtendDate(booking.check_out);
                                                    setOpenDetailModal(true);
                                                }}
                                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 p-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
                                                title="Lihat Detail Lengkap"
                                            >
                                                <Eye className="h-3.5 w-3.5 text-gold" />
                                            </Button>

                                            {booking.payment_receipt_path && (
                                                <Button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setOpenReceiptModal(true);
                                                    }}
                                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] py-1 px-3 rounded-lg flex gap-1 items-center"
                                                >
                                                    Bukti
                                                </Button>
                                            )}

                                            <a
                                                href={getWhatsAppUrl(booking.guest.phone, booking.guest.name, booking.homestay.name)}
                                                target="_blank"
                                                className="border border-white/10 hover:border-gold text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex gap-1 items-center transition-colors font-sans"
                                            >
                                                <PhoneCall className="h-3 w-3 text-gold" /> Chat
                                            </a>

                                            {(booking.status === 'pending_approval' || (auth?.user?.role === 'admin' && (booking.status === 'pending_payment' || booking.status === 'pending_approval'))) && (
                                                <>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setOpenApproveModal(true);
                                                        }}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 h-7 w-7 rounded-lg flex items-center justify-center"
                                                        title="Setujui Booking"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setOpenRejectModal(true);
                                                        }}
                                                        className="bg-rose-500 hover:bg-rose-600 text-white p-1.5 h-7 w-7 rounded-lg flex items-center justify-center"
                                                        title="Tolak Booking"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            )}

                                            {booking.status === 'confirmed' && (
                                                <Button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setOpenCompleteModal(true);
                                                    }}
                                                    className="bg-gold hover:bg-white text-black text-[10px] font-bold py-1 px-3 rounded-lg flex gap-1 items-center"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" /> Check-out
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 1. MODAL: VIEW TRANSFER RECEIPT IMAGE */}
            <Dialog open={openReceiptModal} onOpenChange={setOpenReceiptModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-lg rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Eye className="text-gold h-5 w-5" />
                            Bukti Transfer Tamu
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2">
                            Nama Tamu: <strong>{selectedBooking?.guest.name}</strong> | Tagihan: <strong className="text-gold">Rp {selectedBooking?.total_price.toLocaleString('id-ID')}</strong>.
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
                        {selectedBooking?.status === 'pending_approval' && (
                            <Button
                                onClick={() => {
                                    setOpenReceiptModal(false);
                                    setOpenApproveModal(true);
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 rounded-xl"
                            >
                                Setujui Booking
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. MODAL: CONFIRM APPROVAL */}
            <Dialog open={openApproveModal} onOpenChange={setOpenApproveModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-pulse">
                        <Check className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Setujui Reservasi?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin dana masuk senilai <strong className="text-gold">Rp {selectedBooking?.total_price.toLocaleString('id-ID')}</strong> dari tamu <strong>{selectedBooking?.guest.name}</strong> telah valid?
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
                            Dana reservasi akan ditandai <strong className="text-rose-400">Dibatalkan</strong>. Tamu harus mengunggah berkas transfer valid lainnya untuk verifikasi.
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

            {/* 4. MODAL: CONFIRM CHECK-OUT / COMPLETE */}
            <Dialog open={openCompleteModal} onOpenChange={setOpenCompleteModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4 animate-pulse">
                        <CheckCircle className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Selesaikan Reservasi (Check-out)?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin ingin menyelesaikan masa tinggal tamu <strong>{selectedBooking?.guest.name}</strong> di kamar <strong>{selectedBooking?.homestay.name}</strong>? Status reservasi akan berubah menjadi <strong>Selesai</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenCompleteModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                            disabled={actionProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleComplete}
                            disabled={actionProcessing}
                            className="bg-gold hover:bg-white text-black font-bold text-xs px-6 rounded-xl"
                        >
                            {actionProcessing ? 'Memproses...' : 'Ya, Selesaikan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 5. MODAL: VIEW DETAILED BOOKING DATA */}
            <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-lg rounded-2xl p-6 text-left overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2 text-white">
                            <Eye className="text-gold h-5 w-5" />
                            Detail Lengkap Reservasi #{selectedBooking?.id}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Status: <strong className="text-gold">{selectedBooking ? getStatusText(selectedBooking.status) : ''}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="mt-4 space-y-4">
                            {/* Guest Details */}
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Informasi Tamu</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Nama Lengkap</span>
                                        <span className="font-semibold text-white">{selectedBooking.guest.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Nomor Telepon</span>
                                        <span className="font-semibold text-white">{selectedBooking.guest.phone}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground block text-[10px]">Email</span>
                                        <span className="font-semibold text-white">{selectedBooking.guest.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stay details */}
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Detail Kamar & Menginap</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Kamar / Akomodasi</span>
                                        <span className="font-semibold text-white">{selectedBooking.homestay.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Total Tamu</span>
                                        <span className="font-semibold text-white">{selectedBooking.total_guests} Orang</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Tanggal Check-In</span>
                                        <span className="font-semibold text-white">{formatDate(selectedBooking.check_in)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Tanggal Check-Out</span>
                                        <span className="font-semibold text-white">{formatDate(selectedBooking.check_out)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment details */}
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Transaksi & Pembayaran</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Metode Pembayaran</span>
                                        <span className="font-semibold text-white">{selectedBooking.paymentMethod?.name || 'Manual Bank'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[10px]">Total Biaya</span>
                                        <span className="font-semibold text-gold font-sans text-sm">Rp {selectedBooking.total_price.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons inside Details Modal */}
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-3">
                                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Aksi Cepat</h4>
                                <div className="flex flex-wrap gap-2">
                                    <a
                                        href={getWhatsAppUrl(selectedBooking.guest.phone, selectedBooking.guest.name, selectedBooking.homestay.name)}
                                        target="_blank"
                                        className="border border-white/10 hover:border-gold text-white font-bold text-[10px] py-2 px-4 rounded-xl flex gap-1.5 items-center transition-colors font-sans"
                                    >
                                        <PhoneCall className="h-3.5 w-3.5 text-gold" /> Hubungi Tamu (WA)
                                    </a>

                                    {selectedBooking.payment_receipt_path && (
                                        <Button
                                            onClick={() => {
                                                setOpenDetailModal(false);
                                                setOpenReceiptModal(true);
                                            }}
                                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] py-2 px-4 rounded-xl flex gap-1.5 items-center"
                                        >
                                            Lihat Bukti Transfer
                                        </Button>
                                    )}

                                    {selectedBooking.status === 'pending_approval' && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    setOpenDetailModal(false);
                                                    setOpenApproveModal(true);
                                                }}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 px-4 rounded-xl flex gap-1.5 items-center"
                                            >
                                                <Check className="h-3.5 w-3.5" /> Setujui Booking
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setOpenDetailModal(false);
                                                    setOpenRejectModal(true);
                                                }}
                                                className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-2 px-4 rounded-xl flex gap-1.5 items-center"
                                            >
                                                <X className="h-3.5 w-3.5" /> Tolak Booking
                                            </Button>
                                        </>
                                    )}

                                    {selectedBooking.status === 'confirmed' && (
                                        <Button
                                            onClick={() => {
                                                setOpenDetailModal(false);
                                                setOpenCompleteModal(true);
                                            }}
                                            className="bg-gold hover:bg-white text-black text-[10px] font-bold py-2 px-4 rounded-xl flex gap-1.5 items-center"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5" /> Selesaikan & Check-out
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Stay Extension Form (for confirmed or completed bookings) */}
                            {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed') && (
                                <div className="bg-black/30 p-4 rounded-xl border border-gold/20 space-y-3">
                                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                                        <CalendarCheck className="h-4 w-4" /> Perpanjang Masa Menginap
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        Perpanjang tanggal check-out tamu. Sistem akan menghitung ulang biaya sewa dan memverifikasi ketersediaan kamar secara otomatis.
                                    </p>
                                    
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[9px] text-muted-foreground block">Tanggal Check-Out Baru</label>
                                            <Input
                                                type="date"
                                                value={extendDate}
                                                onChange={(e) => setExtendDate(e.target.value)}
                                                className="bg-black/40 border-white/10 text-xs text-white placeholder-white/20 focus:border-gold"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleExtend}
                                            disabled={actionProcessing}
                                            className="bg-gold hover:bg-white text-black font-bold text-xs px-4 py-2.5 rounded-xl h-[38px] flex items-center justify-center shrink-0"
                                        >
                                            {actionProcessing ? 'Memproses...' : 'Perpanjang'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="pt-4 border-t border-white/5 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpenDetailModal(false)}
                            className="bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold px-6"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
