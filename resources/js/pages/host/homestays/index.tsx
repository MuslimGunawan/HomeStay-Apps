import { Head, Link, router, usePage } from '@inertiajs/react';
import { Hotel, Plus, Edit, Trash2, MapPin, Star, AlertTriangle, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Homestay {
    id: number;
    name: string;
    slug: string;
    description: string;
    address: string;
    city: string;
    price_per_night: number;
    max_guests: number;
    status: string;
    media: Array<{ file_path: string; is_primary: boolean }>;
}

interface HomestaysProps {
    homestays: Homestay[];
}

export default function Homestays({ homestays = [] }: HomestaysProps) {
    const { auth } = usePage().props as any;
    const prefix = auth?.user?.role === 'admin' ? 'admin' : 'host';
    const [selectedHomestay, setSelectedHomestay] = useState<Homestay | null>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const handleDelete = () => {
        if (!selectedHomestay) {
return;
}

        setDeleteProcessing(true);
        router.post(route(`${prefix}.homestays.delete` as any, { id: selectedHomestay.id }), {}, {
            onSuccess: () => {
                toast.success('Listing homestay berhasil dihapus permanen.');
                setOpenDeleteModal(false);
                setDeleteProcessing(false);
            },
            onError: () => {
                toast.error('Gagal menghapus homestay.');
                setDeleteProcessing(false);
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Manajemen Homestay" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">
                        {auth?.user?.role === 'admin' ? 'Portal Administrator' : 'Portal Pemilik'}
                    </span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">
                        {auth?.user?.role === 'admin' ? 'Daftar Semua Kamar' : 'Daftar Kamar Anda'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {auth?.user?.role === 'admin' ? 'Kelola semua listing kamar, edit detail, dan hapus penawaran kamar secara global.' : 'Kelola listing kamar, edit detail, dan hapus penawaran kamar.'}
                    </p>
                </div>
                <Button 
                    onClick={() => router.get(route(`${prefix}.homestays.create` as any))}
                    className="bg-gold hover:bg-white text-black font-bold text-xs py-5 px-6 rounded-xl flex gap-2 items-center"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Homestay Baru
                </Button>
            </div>

            {/* Listings Grid */}
            {homestays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <Hotel className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Belum Ada Listing</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">Anda belum menambahkan kamar homestay di Lhokseumawe. Klik tombol di atas untuk mendaftarkan kamar pertama Anda!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {homestays.map((homestay) => {
                        const primaryImg = homestay.media.find(m => m.is_primary) || homestay.media[0];

                        return (
                            <Card key={homestay.id} className="overflow-hidden border border-white/5 bg-[#0f0f0f] flex flex-col h-full text-left">
                                <div className="relative aspect-video w-full overflow-hidden bg-white/5 shrink-0">
                                    <img 
                                        src={primaryImg?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'} 
                                        alt={homestay.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                            homestay.display_status === 'aktif' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : homestay.display_status === 'tersewa'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'bg-white/10 text-white/50 border border-white/10'
                                        }`}>
                                            {homestay.display_status === 'aktif' && 'Aktif'}
                                            {homestay.display_status === 'tersewa' && 'Tersewa'}
                                            {homestay.display_status === 'tutup' && 'Tutup'}
                                        </span>
                                    </div>
                                </div>
                                <CardHeader className="p-6 pb-2">
                                    <CardTitle className="font-outfit text-base font-bold text-white line-clamp-1">{homestay.name}</CardTitle>
                                    <CardDescription className="flex items-center text-[10px] text-gold font-bold">
                                        <MapPin className="h-3.5 w-3.5 mr-1" />
                                        {homestay.address}, {homestay.city}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-2 text-xs text-muted-foreground flex-1">
                                    <p className="line-clamp-2 leading-relaxed">{homestay.description}</p>
                                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-[11px] text-white">
                                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-gold shrink-0" /> Maks. {homestay.max_guests} Tamu</span>
                                        <span className="font-bold text-gold ml-auto">Rp {parseFloat(homestay.price_per_night as any).toLocaleString('id-ID')}/mlm</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 gap-3 mt-auto shrink-0">
                                    <Button
                                        onClick={() => router.get(route(`${prefix}.homestays.edit` as any, { id: homestay.id }))}
                                        className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                                    >
                                        <Edit className="h-4 w-4" /> Edit Kamar
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setSelectedHomestay(homestay);
                                            setOpenDeleteModal(true);
                                        }}
                                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* CONFIRMATION DELETE MODAL */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 animate-bounce">
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Hapus Listing Homestay?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin ingin menghapus homestay <strong>{selectedHomestay?.name}</strong> secara permanen dari sistem? Seluruh galeri media and riwayat booking terkait akan terhapus.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenDeleteModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                            disabled={deleteProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteProcessing}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            {deleteProcessing ? 'Menghapus...' : 'Ya, Hapus Listing'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
