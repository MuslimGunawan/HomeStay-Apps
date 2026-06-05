import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Check, PhoneCall, Calendar, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Complaint {
    id: number;
    message: string;
    status: string;
    created_at: string;
    guest: {
        name: string;
        phone: string;
    };
    homestay: {
        name: string;
    };
    booking: {
        check_in: string;
        check_out: string;
    };
}

interface ComplaintsProps {
    complaints: Complaint[];
}

export default function Complaints({ complaints = [] }: ComplaintsProps) {
    const { auth } = usePage().props as any;
    const prefix = auth?.user?.role === 'admin' ? 'admin' : 'host';
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [openResolveModal, setOpenResolveModal] = useState(false);
    const [resolveProcessing, setResolveProcessing] = useState(false);

    const getWhatsAppUrl = (phone: string, guestName: string, homestayName: string, complaintMsg: string) => {
        const cleanedPhone = phone.replace(/^0/, '62');
        const text = encodeURIComponent(
            `Halo Kak ${guestName}, saya Host dari penginapan ${homestayName}. Saya menerima aduan Anda mengenai: "${complaintMsg}". Kami siap membantu mengatasi kendala ini...`
        );

        return `https://wa.me/${cleanedPhone}?text=${text}`;
    };

    const handleResolve = () => {
        if (!selectedComplaint) {
return;
}

        setResolveProcessing(true);
        router.post(route(`${prefix}.complaints.resolve` as any, { id: selectedComplaint.id }), {}, {
            onSuccess: () => {
                toast.success('Keluhan berhasil ditandai sebagai Selesai ditangani (Resolved).');
                setOpenResolveModal(false);
                setResolveProcessing(false);
            },
            onError: () => {
                toast.error('Gagal menyelesaikan keluhan.');
                setResolveProcessing(false);
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-4xl mx-auto text-left">
            <Head title="Manajemen Aduan Tamu" />

            {/* Title block */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">
                    {auth?.user?.role === 'admin' ? 'Portal Administrator' : 'Portal Pemilik'}
                </span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Keluhan Aktif Tamu Menginap</h1>
                <p className="text-sm text-muted-foreground">Tangani secara responsif aduan fasilitas dari tamu yang sedang stay untuk menjaga kenyamanan.</p>
            </div>

            {/* Complaints list */}
            {complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <Sparkles className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Semua Masalah Teratasi</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">Tamu belum memiliki aduan fasilitas atau keluhan kenyamanan di homestay Anda.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {complaints.map((complaint) => (
                        <Card key={complaint.id} className={`border p-6 text-left relative overflow-hidden flex flex-col justify-between ${
                            complaint.status === 'pending' 
                                ? 'border-rose-500/20 bg-rose-500/[0.02]' 
                                : 'border-white/5 bg-[#0f0f0f]'
                        }`}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-xs">{complaint.guest.name}</h4>
                                            <span className="text-[10px] text-muted-foreground">di {complaint.homestay.name}</span>
                                            {complaint.status === 'pending' ? (
                                                <span className="rounded bg-rose-500/10 px-2 py-0.5 font-bold text-rose-400 uppercase tracking-widest text-[8px] border border-rose-500/20 flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" /> Pending
                                                </span>
                                            ) : (
                                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 uppercase tracking-widest text-[8px] border border-emerald-500/20 flex items-center gap-1">
                                                    <Check className="h-2.5 w-2.5" /> Resolved
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-white/30 block mt-0.5">{new Date(complaint.created_at).toLocaleString('id-ID')}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={getWhatsAppUrl(complaint.guest.phone, complaint.guest.name, complaint.homestay.name, complaint.message)}
                                            target="_blank"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-black transition-colors"
                                        >
                                            <PhoneCall className="h-4 w-4" />
                                        </a>
                                        {complaint.status === 'pending' && (
                                            <Button
                                                onClick={() => {
                                                    setSelectedComplaint(complaint);
                                                    setOpenResolveModal(true);
                                                }}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 h-8 w-8 rounded-full shrink-0"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                                    <div className="text-white/40 block text-[10px] font-bold uppercase tracking-wider">Aduan Fasilitas Kamar</div>
                                    <p className="text-white leading-relaxed text-xs">
                                        "{complaint.message}"
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* CONFIRMATION RESOLVE COMPLAINT */}
            <Dialog open={openResolveModal} onOpenChange={setOpenResolveModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-pulse">
                        <Check className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Selesaikan Aduan Kamar?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda telah mengatasi keluhan stay tamu <strong>{selectedComplaint?.guest.name}</strong> secara tuntas? Status keluhan akan berubah menjadi <strong>Resolved</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenResolveModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                            disabled={resolveProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleResolve}
                            disabled={resolveProcessing}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            {resolveProcessing ? 'Menyelesaikan...' : 'Ya, Selesaikan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
