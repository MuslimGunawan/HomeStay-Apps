import { Head, useForm, router, Link } from '@inertiajs/react';
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
    Star,
    Upload,
    FileText
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    total_price: number;
    status: string;
    payment_receipt_path?: string;
    homestay: {
        id: number;
        name: string;
        city: string;
        address: string;
        media: Array<{ file_path: string; is_primary: boolean }>;
    };
    payment_method?: {
        name: string;
        type: string;
        account_number: string;
        account_name: string;
        qris_image_path?: string;
    };
}

interface GuestBookingsProps {
    bookings: Booking[];
}

export default function GuestBookings({ bookings = [] }: GuestBookingsProps) {
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
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [openComplaintModal, setOpenComplaintModal] = useState(false);
    
    // Receipt Upload Form
    const receiptForm = useForm({
        receipt: null as File | null,
    });

    // Review Form
    const reviewForm = useForm({
        rating: 5,
        comment: '',
    });

    // Complaint Form
    const complaintForm = useForm({
        message: '',
    });

    const handleUploadReceipt = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBooking) {
            return;
        }
        
        receiptForm.post(route('bookings.receipt', { id: selectedBooking.id }), {
            onSuccess: () => {
                toast.success('Bukti transfer berhasil diunggah. Mohon tunggu verifikasi Host.');
                setOpenReceiptModal(false);
                receiptForm.reset();
            },
            onError: () => {
                toast.error('Gagal mengunggah bukti transfer. Pastikan file berupa foto maksimal 15MB.');
            }
        });
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBooking) {
            return;
        }

        reviewForm.post(route('guest.review.submit', { bookingId: selectedBooking.id }), {
            onSuccess: () => {
                toast.success('Terima kasih atas ulasan premium Anda!');
                setOpenReviewModal(false);
                reviewForm.reset();
            },
            onError: () => {
                toast.error('Gagal mengirimkan ulasan.');
            }
        });
    };

    const handleSubmitComplaint = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBooking) {
            return;
        }

        complaintForm.post(route('guest.complaint.submit', { bookingId: selectedBooking.id }), {
            onSuccess: () => {
                toast.success('Keluhan Anda berhasil dikirim ke Host. Stay manager akan segera merespons.');
                setOpenComplaintModal(false);
                complaintForm.reset();
            },
            onError: () => {
                toast.error('Gagal mengirimkan keluhan.');
            }
        });
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
            <Head title="Pesanan Saya" />

            {/* Title Block */}
            <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Tamu</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Pesanan & Kamar Saya</h1>
                <p className="text-sm text-muted-foreground">Lihat riwayat menginap, konfirmasi pembayaran, ulasan kamar, dan kirimkan aduan untuk homestay Anda.</p>
            </div>

            {/* Bookings Listing Grid */}
            <div className="space-y-6">
                {bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                        <Calendar className="h-10 w-10 text-gold/40 animate-pulse" />
                        <h4 className="font-bold text-white">Belum Ada Pemesanan</h4>
                        <p className="text-xs text-muted-foreground max-w-xs">Anda belum pernah melakukan pemesanan homestay. Cari penginapan mewah untuk staycation Anda berikutnya!</p>
                        <Button onClick={() => router.get('/explore')} className="bg-gold hover:bg-white text-black font-bold text-xs rounded-full">
                            Cari Kamar Homestay
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {bookings.map((booking) => {
                            const primaryImg = booking.homestay.media.find(m => m.is_primary) || booking.homestay.media[0];

                            return (
                                <Card key={booking.id} className="overflow-hidden border border-white/5 bg-[#0f0f0f] flex flex-col text-left">
                                    <div className="relative aspect-video w-full overflow-hidden bg-white/5 shrink-0">
                                        <img 
                                            src={primaryImg?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'} 
                                            alt={booking.homestay.name}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
                                        <div className="absolute top-4 right-4">
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>
                                    <CardHeader className="p-6">
                                        <CardTitle className="font-outfit text-lg font-bold text-white">{booking.homestay.name}</CardTitle>
                                        <CardDescription className="flex items-center text-xs text-gold font-bold mt-1">
                                            <MapPin className="h-3.5 w-3.5 mr-1" />
                                            {booking.homestay.address}, {booking.homestay.city}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 space-y-4 flex-1">
                                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-y border-white/5 py-4">
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-white/30">Check-in</span>
                                                <span className="font-bold text-white mt-1 block">{formatDate(booking.check_in)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-white/30">Check-out</span>
                                                <span className="font-bold text-white mt-1 block">{formatDate(booking.check_out)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-white/30">Jumlah Tamu</span>
                                                <span className="font-bold text-white mt-1 block flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-gold" />
                                                    {booking.total_guests} Orang
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-white/30">Total Biaya</span>
                                                <span className="font-bold text-gold mt-1 block">Rp {booking.total_price.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0 gap-3 mt-auto shrink-0 flex flex-wrap">
                                        {booking.status === 'pending_payment' && (
                                            <Button 
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setOpenReceiptModal(true);
                                                }}
                                                className="w-full bg-gold hover:bg-white text-black font-bold text-xs py-5 rounded-xl flex items-center justify-center gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Unggah Bukti Transfer
                                            </Button>
                                        )}
                                        
                                        {booking.status === 'confirmed' && (
                                            <Link
                                                href="/guest/complaints"
                                                className="w-full border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2"
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                                Kirim Laporan Keluhan
                                            </Link>
                                        )}

                                        {booking.status === 'completed' && (
                                            <Button 
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setOpenReviewModal(true);
                                                }}
                                                className="w-full bg-white hover:bg-gold text-black font-bold text-xs py-5 rounded-xl flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Berikan Ulasan Kamar
                                            </Button>
                                        )}

                                        <Button 
                                            onClick={() => router.get(`/bookings/${booking.id}/success`)}
                                            variant="secondary"
                                            className="w-full text-xs font-bold py-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                        >
                                            Lihat E-Receipt Detail
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 1. MODAL: UPLOAD RECEIPT */}
            <Dialog open={openReceiptModal} onOpenChange={setOpenReceiptModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <CreditCard className="text-gold h-5 w-5" />
                            Unggah Bukti Transfer
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Pemesanan Anda terikat metode pembayaran <strong>{selectedBooking?.payment_method?.name}</strong>. Silakan transfer tepat sebesar <strong className="text-gold">Rp {selectedBooking?.total_price.toLocaleString('id-ID')}</strong> ke rekening berikut:
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking?.payment_method && (
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-white/40">Bank / Penerima</span>
                                <span className="font-bold">{selectedBooking.payment_method.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40">Nomor Rekening / HP</span>
                                <span className="font-bold text-gold tracking-wider">{selectedBooking.payment_method.account_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40">Atas Nama</span>
                                <span className="font-bold">{selectedBooking.payment_method.account_name}</span>
                            </div>
                            {selectedBooking.payment_method.qris_image_path && (
                                <div className="pt-2 flex flex-col items-center">
                                    <span className="block text-[10px] text-white/40 mb-1.5">Scan QRIS E-Wallet</span>
                                    <img src={selectedBooking.payment_method.qris_image_path} alt="QRIS" className="h-32 w-32 rounded-xl object-contain bg-white p-2" />
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleUploadReceipt} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="receipt" className="text-xs text-white/60">Pilih Berkas Foto Bukti Transfer</Label>
                            <Input 
                                id="receipt"
                                type="file" 
                                accept="image/*"
                                onChange={(e) => receiptForm.setData('receipt', e.target.files ? e.target.files[0] : null)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-gold cursor-pointer"
                            />
                            {receiptForm.errors.receipt && (
                                <span className="text-[10px] text-red-400">{receiptForm.errors.receipt}</span>
                            )}
                        </div>

                        <DialogFooter className="gap-2 pt-2">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setOpenReceiptModal(false)}
                                className="text-white/60 hover:text-white"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={receiptForm.processing || !receiptForm.data.receipt}
                                className="bg-gold hover:bg-white text-black font-bold text-xs px-6 rounded-xl"
                            >
                                {receiptForm.processing ? 'Mengirim...' : 'Kirim Bukti Transfer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. MODAL: LEAVE REVIEW */}
            <Dialog open={openReviewModal} onOpenChange={setOpenReviewModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Star className="text-gold h-5 w-5 fill-gold shrink-0" />
                            Tulis Ulasan Kamar
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Berikan rating bintang dan ulasan jujur Anda untuk penginapan <strong>{selectedBooking?.homestay.name}</strong> untuk membantu tamu lain.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-white/60">Rating Skor Bintang</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => reviewForm.setData('rating', star)}
                                        className="focus:outline-none transition-transform active:scale-95"
                                    >
                                        <Star className={`h-8 w-8 ${reviewForm.data.rating >= star ? 'fill-gold text-gold' : 'text-white/20'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="comment" className="text-xs text-white/60">Komentar / Pengalaman Menginap</Label>
                            <textarea
                                id="comment"
                                rows={4}
                                placeholder="Bagaimana kenyamanan kamar, fasilitas, dan keramahan host?"
                                value={reviewForm.data.comment}
                                onChange={(e) => reviewForm.setData('comment', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                            ></textarea>
                            {reviewForm.errors.comment && (
                                <span className="text-[10px] text-red-400">{reviewForm.errors.comment}</span>
                            )}
                        </div>

                        <DialogFooter className="gap-2 pt-2">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setOpenReviewModal(false)}
                                className="text-white/60 hover:text-white"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={reviewForm.processing || !reviewForm.data.comment}
                                className="bg-gold hover:bg-white text-black font-bold text-xs px-6 rounded-xl"
                            >
                                {reviewForm.processing ? 'Mengirim...' : 'Kirim Ulasan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
