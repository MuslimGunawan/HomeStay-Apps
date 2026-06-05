import { Head, useForm, router } from '@inertiajs/react';
import { 
    Sparkles, 
    Plus, 
    Edit, 
    Trash2, 
    Tag, 
    Search,
    AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Amenity {
    id: number;
    name: string;
    icon: string;
    description?: string;
}

interface AmenitiesProps {
    amenities: Amenity[];
}

export default function AmenitiesIndex({ amenities = [] }: AmenitiesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    // Add Form
    const addForm = useForm({
        name: '',
        icon: 'Sparkles',
        description: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        icon: 'Sparkles',
        description: '',
    });

    const handleAddAmenity = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('admin.amenities.store'), {
            onSuccess: () => {
                toast.success('Fasilitas global baru berhasil ditambahkan.');
                setOpenAddModal(false);
                addForm.reset();
            },
            onError: () => {
                toast.error('Gagal menambahkan fasilitas global. Nama harus unik.');
            }
        });
    };

    const handleEditAmenity = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAmenity) {
return;
}

        editForm.post(route('admin.amenities.update', { id: selectedAmenity.id }), {
            onSuccess: () => {
                toast.success('Fasilitas global berhasil diperbarui.');
                setOpenEditModal(false);
            },
            onError: () => {
                toast.error('Gagal memperbarui fasilitas global.');
            }
        });
    };

    const handleDeleteAmenity = () => {
        if (!selectedAmenity) {
return;
}

        router.post(route('admin.amenities.delete', { id: selectedAmenity.id }), {}, {
            onSuccess: () => {
                toast.success('Fasilitas global berhasil dihapus.');
                setOpenDeleteModal(false);
            },
            onError: () => {
                toast.error('Gagal menghapus fasilitas global.');
            }
        });
    };

    const filteredAmenities = amenities.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Kelola Fasilitas Global" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Administrator</span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Manajemen Fasilitas Akomodasi</h1>
                    <p className="text-sm text-muted-foreground">Kelola pustaka fasilitas global (Amenities) yang dapat dipilih oleh pemilik Homestay.</p>
                </div>
                <Button 
                    onClick={() => setOpenAddModal(true)}
                    className="bg-gold hover:bg-white text-black font-bold text-xs py-5 px-6 rounded-xl flex gap-2 items-center"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Fasilitas Baru
                </Button>
            </div>

            {/* Search toolbar */}
            <div className="relative w-full sm:w-80 mb-6">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input 
                    placeholder="Cari nama fasilitas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-white/20 focus:border-gold"
                />
            </div>

            {/* Table list */}
            {filteredAmenities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <Sparkles className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Tidak Ada Fasilitas</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">Daftar fasilitas global kosong. Tambahkan fasilitas standar global agar pemilik homestay dapat mencentang fasilitas tersebut.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f0f0f]">
                    <table className="w-full text-xs text-left text-white/70">
                        <thead className="text-[10px] text-white/40 uppercase bg-black/40 border-b border-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4">Ikon</th>
                                <th scope="col" className="px-6 py-4">Nama Fasilitas</th>
                                <th scope="col" className="px-6 py-4">Penjelasan Singkat</th>
                                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAmenities.map((amenity) => (
                                <tr key={amenity.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        {amenity.name}
                                    </td>
                                    <td className="px-6 py-4 text-white/50 leading-relaxed font-sans max-w-sm">
                                        {amenity.description || 'Fasilitas premium untuk homestay.'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                onClick={() => {
                                                    setSelectedAmenity(amenity);
                                                    editForm.setData({
                                                        name: amenity.name,
                                                        icon: amenity.icon || 'Sparkles',
                                                        description: amenity.description || '',
                                                    });
                                                    setOpenEditModal(true);
                                                }}
                                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold py-1 px-3 rounded-lg flex gap-1 items-center"
                                            >
                                                <Edit className="h-3.5 w-3.5" /> Edit
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    setSelectedAmenity(amenity);
                                                    setOpenDeleteModal(true);
                                                }}
                                                className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 p-2 rounded-lg"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 1. MODAL: ADD AMENITY */}
            <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Plus className="text-gold h-5 w-5" />
                            Tambah Fasilitas Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Masukkan nama amenities baru ke dalam pustaka global akomodasi homestay.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddAmenity} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="add_name" className="text-xs text-white/60">Nama Fasilitas (Cth: WiFi Cepat, AC Hemat)</Label>
                            <Input 
                                id="add_name"
                                value={addForm.data.name}
                                onChange={(e) => addForm.setData('name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_icon" className="text-xs text-white/60">Identitas Ikon Lucide</Label>
                            <Input 
                                id="add_icon"
                                value={addForm.data.icon}
                                onChange={(e) => addForm.setData('icon', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_desc" className="text-xs text-white/60">Penjelasan Singkat Fasilitas</Label>
                            <textarea
                                id="add_desc"
                                rows={3}
                                placeholder="Jelaskan secara singkat fasilitas ini..."
                                value={addForm.data.description}
                                onChange={(e) => addForm.setData('description', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                            ></textarea>
                        </div>

                        <DialogFooter className="gap-2 pt-4 border-t border-white/5 mt-4">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setOpenAddModal(false)}
                                className="text-white/60 hover:text-white"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={addForm.processing}
                                className="bg-gold hover:bg-white text-black font-bold text-xs px-6 rounded-xl"
                            >
                                {addForm.processing ? 'Menyimpan...' : 'Simpan Fasilitas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. MODAL: EDIT AMENITY */}
            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Edit className="text-gold h-5 w-5" />
                            Perbarui Fasilitas Global
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Perbarui nama atau deskripsi fasilitas terpilih.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditAmenity} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_name" className="text-xs text-white/60">Nama Fasilitas</Label>
                            <Input 
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_icon" className="text-xs text-white/60">Identitas Ikon Lucide</Label>
                            <Input 
                                id="edit_icon"
                                value={editForm.data.icon}
                                onChange={(e) => editForm.setData('icon', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_desc" className="text-xs text-white/60">Penjelasan Singkat</Label>
                            <textarea
                                id="edit_desc"
                                rows={3}
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                            ></textarea>
                        </div>

                        <DialogFooter className="gap-2 pt-4 border-t border-white/5 mt-4">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setOpenEditModal(false)}
                                className="text-white/60 hover:text-white"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={editForm.processing}
                                className="bg-gold hover:bg-white text-black font-bold text-xs px-6 rounded-xl"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Fasilitas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 3. MODAL: DELETE AMENITY */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 animate-bounce">
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Hapus Fasilitas Global?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin ingin menghapus fasilitas global <strong>{selectedAmenity?.name}</strong>? Aksi ini akan mencopot penanda fasilitas ini dari seluruh listing homestay yang terikat secara otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2 pt-6 mt-4 border-t border-white/5 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpenDeleteModal(false)}
                            className="text-white/60 hover:text-white text-xs font-bold"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleDeleteAmenity}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
