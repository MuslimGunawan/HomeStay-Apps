import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList, 
    Clock, 
    Check, 
    Mail, 
    User, 
    Eye, 
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SupportTicket {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

interface SupportProps {
    tickets: SupportTicket[];
}

export default function SupportTickets({ tickets = [] }: SupportProps) {
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [openResolveModal, setOpenResolveModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [actionProcessing, setActionProcessing] = useState(false);

    const handleResolve = () => {
        if (!selectedTicket) return;
        setActionProcessing(true);
        router.post(route('admin.support.resolve', { id: selectedTicket.id }), {}, {
            onSuccess: () => {
                toast.success('Tiket support berhasil ditandai sebagai Selesai ditangani (Resolved).');
                setOpenResolveModal(false);
                setActionProcessing(false);
            },
            onError: () => {
                toast.error('Gagal menyelesaikan tiket.');
                setActionProcessing(false);
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-5xl mx-auto text-left">
            <Head title="Manajemen Tiket Bantuan" />

            {/* Title block */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Administrator</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Pusat Tiket Bantuan Publik</h1>
                <p className="text-sm text-muted-foreground">Tinjau laporan kendala, saran, and pertanyaan yang dikirimkan oleh pengunjung umum melalui Help Center.</p>
            </div>

            {/* Tickets List */}
            {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <ClipboardList className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Semua Pertanyaan Terjawab</h4>
                    <p className="text-xs text-muted-foreground max-w-sm font-sans">Belum ada aduan tiket bantuan publik yang dikirimkan pengunjung umum website homestay Anda.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id} className={`border p-6 text-left relative overflow-hidden flex flex-col justify-between ${
                            ticket.status === 'pending' 
                                ? 'border-yellow-500/20 bg-yellow-500/[0.01]' 
                                : 'border-white/5 bg-[#0f0f0f]'
                        }`}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-xs">{ticket.name}</h4>
                                            <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-1"><Mail className="h-3 w-3" /> {ticket.email}</span>
                                            {ticket.status === 'pending' ? (
                                                <span className="rounded bg-yellow-500/10 px-2 py-0.5 font-bold text-yellow-500 uppercase tracking-widest text-[8px] border border-yellow-500/20 flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" /> Pending
                                                </span>
                                            ) : (
                                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 uppercase tracking-widest text-[8px] border border-emerald-500/20 flex items-center gap-1">
                                                    <Check className="h-2.5 w-2.5" /> Resolved
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-white/30 block mt-0.5">{new Date(ticket.created_at).toLocaleString('id-ID')}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setOpenDetailsModal(true);
                                            }}
                                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold p-2 h-8 w-8 rounded-full"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        
                                        {ticket.status === 'pending' && (
                                            <Button
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
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
                                    <div className="text-white font-bold text-xs flex gap-1.5 items-center"><MessageSquare className="h-3.5 w-3.5 text-gold" /> Subjek: {ticket.subject}</div>
                                    <p className="text-white/60 leading-relaxed text-xs pt-1 font-sans">
                                        "{ticket.message}"
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 1. MODAL: DETAILED DESCRIPTION VIEW */}
            <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left font-sans">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <ClipboardList className="text-gold h-5 w-5" />
                            Detail Aduan Tiket
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Milik: <strong>{selectedTicket?.name}</strong> ({selectedTicket?.email}) | Dikirim pada: <strong>{selectedTicket && new Date(selectedTicket.created_at).toLocaleString('id-ID')}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTicket && (
                        <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                            <div className="space-y-1">
                                <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Subjek / Topik Pertanyaan</span>
                                <span className="text-white font-bold">{selectedTicket.subject}</span>
                            </div>
                            <div className="space-y-1 bg-black/40 border border-white/5 p-4 rounded-xl">
                                <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1">Isi Laporan Masalah</span>
                                <p className="text-white/70 leading-relaxed font-normal">
                                    {selectedTicket.message}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-4 border-t border-white/5 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpenDetailsModal(false)}
                            className="bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold px-6"
                        >
                            Tutup
                        </Button>
                        {selectedTicket?.status === 'pending' && (
                            <Button
                                onClick={() => {
                                    setOpenDetailsModal(false);
                                    setOpenResolveModal(true);
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 rounded-xl"
                            >
                                Tandai Selesai
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. CONFIRMATION RESOLVE MODAL */}
            <Dialog open={openResolveModal} onOpenChange={setOpenResolveModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-pulse">
                        <Check className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Selesaikan Tiket Bantuan?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda telah menjawab laporan kendala dari pengunjung <strong>{selectedTicket?.name}</strong> secara tuntas? Status tiket akan berubah menjadi <strong>Resolved</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenResolveModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                            disabled={actionProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleResolve}
                            disabled={actionProcessing}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            {actionProcessing ? 'Memproses...' : 'Ya, Selesaikan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
