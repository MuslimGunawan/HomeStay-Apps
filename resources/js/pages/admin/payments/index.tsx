import { Head, useForm, router } from '@inertiajs/react';
import { 
    CreditCard, 
    Plus, 
    Edit, 
    Trash2, 
    Check, 
    X, 
    QrCode, 
    Sparkles, 
    Image as ImageIcon,
    AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentMethod {
    id: number;
    name: string;
    type: string;
    account_number: string;
    account_name: string;
    qris_image_path?: string;
    is_active: boolean;
}

interface PaymentsProps {
    paymentMethods: PaymentMethod[];
}

export default function Payments({ paymentMethods = [] }: PaymentsProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openQrisModal, setOpenQrisModal] = useState(false);

    // Add Form
    const addForm = useForm({
        name: '',
        type: 'bank',
        account_number: '',
        account_name: '',
        qris_image: null as File | null,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        type: 'bank',
        account_number: '',
        account_name: '',
        qris_image: null as File | null,
        is_active: true,
    });

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('admin.payments.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Metode pembayaran baru berhasil ditambahkan.');
                setOpenAddModal(false);
                addForm.reset();
            },
            onError: () => {
                toast.error('Gagal menambahkan metode pembayaran.');
            }
        });
    };

    const handleEditMethod = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMethod) {
return;
}

        editForm.post(route('admin.payments.update', { id: selectedMethod.id }), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Metode pembayaran berhasil diperbarui.');
                setOpenEditModal(false);
            },
            onError: () => {
                toast.error('Gagal memperbarui metode pembayaran.');
            }
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(route('admin.payments.toggle', { id }), {}, {
            onSuccess: () => {
                toast.success('Status aktifasi metode pembayaran berhasil dirubah.');
            }
        });
    };

    const handleDeleteMethod = () => {
        if (!selectedMethod) {
return;
}

        router.post(route('admin.payments.delete', { id: selectedMethod.id }), {}, {
            onSuccess: () => {
                toast.success('Metode pembayaran berhasil dihapus.');
                setOpenDeleteModal(false);
            },
            onError: () => {
                toast.error('Gagal menghapus metode pembayaran.');
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Metode Pembayaran" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Administrator</span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Kelola Rekening & QRIS</h1>
                    <p className="text-sm text-muted-foreground">Konfigurasi rekening bank transfer, e-wallet, dan QRIS instan bagi checkout tamu.</p>
                </div>
                <Button 
                    onClick={() => setOpenAddModal(true)}
                    className="bg-gold hover:bg-white text-black font-bold text-xs py-5 px-6 rounded-xl flex gap-2 items-center"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Metode Bayar
                </Button>
            </div>

            {/* Methods list */}
            {paymentMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <CreditCard className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Tidak Ada Metode Pembayaran</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">Tambahkan metode pembayaran baru (Cth: BSI, Bank Aceh, DANA, GoPay) agar tamu dapat menyelesaikan transaksi stay.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f0f0f]">
                    <table className="w-full text-xs text-left text-white/70">
                        <thead className="text-[10px] text-white/40 uppercase bg-black/40 border-b border-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nama Instansi</th>
                                <th scope="col" className="px-6 py-4">Jenis (Type)</th>
                                <th scope="col" className="px-6 py-4">No. Rekening / No. HP</th>
                                <th scope="col" className="px-6 py-4">Atas Nama Owner</th>
                                <th scope="col" className="px-6 py-4 text-center">QRIS</th>
                                <th scope="col" className="px-6 py-4 text-center">Status Keaktifan</th>
                                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paymentMethods.map((method) => (
                                <tr key={method.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">
                                        {method.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="capitalize">{method.type === 'ewallet' ? 'E-Wallet' : method.type}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-semibold text-gold tracking-wider">
                                        {method.account_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        {method.account_name}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {method.qris_image_path ? (
                                            <Button
                                                onClick={() => {
                                                    setSelectedMethod(method);
                                                    setOpenQrisModal(true);
                                                }}
                                                className="bg-gold/10 hover:bg-gold hover:text-black text-gold p-1.5 h-7 w-7 rounded-lg mx-auto"
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <span className="text-white/20">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            onClick={() => handleToggleStatus(method.id)}
                                            className={`text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full border transition-all ${
                                                method.is_active 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                    : 'bg-white/5 border-white/10 text-white/40'
                                            }`}
                                        >
                                            {method.is_active ? 'Aktif' : 'Non-Aktif'}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                onClick={() => {
                                                    setSelectedMethod(method);
                                                    editForm.setData({
                                                        name: method.name,
                                                        type: method.type,
                                                        account_number: method.account_number,
                                                        account_name: method.account_name,
                                                        qris_image: null,
                                                        is_active: method.is_active,
                                                    });
                                                    setOpenEditModal(true);
                                                }}
                                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold py-1 px-3 rounded-lg flex gap-1 items-center"
                                            >
                                                <Edit className="h-3.5 w-3.5" /> Edit
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    setSelectedMethod(method);
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

            {/* 1. MODAL: ADD METHOD */}
            <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <CreditCard className="text-gold h-5 w-5" />
                            Tambah Metode Pembayaran
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Buat pintu transfer baru bank/ewallet untuk penagihan checkout sewa homestay.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddMethod} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="add_name" className="text-xs text-white/60">Nama Bank / HP (Cth: BSI, DANA)</Label>
                            <Input 
                                id="add_name"
                                value={addForm.data.name}
                                onChange={(e) => addForm.setData('name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="add_type" className="text-xs text-white/60">Jenis Pembayaran</Label>
                                <select
                                    id="add_type"
                                    value={addForm.data.type}
                                    onChange={(e) => addForm.setData('type', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                                >
                                    <option value="bank">Bank Transfer</option>
                                    <option value="ewallet">E-Wallet</option>
                                    <option value="custom">Kustom Lainnya</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="add_number" className="text-xs text-white/60">No. Rekening / No. HP</Label>
                                <Input 
                                    id="add_number"
                                    value={addForm.data.account_number}
                                    onChange={(e) => addForm.setData('account_number', e.target.value)}
                                    className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_acc_name" className="text-xs text-white/60">Atas Nama Penerima (Pemilik Rekening)</Label>
                            <Input 
                                id="add_acc_name"
                                value={addForm.data.account_name}
                                onChange={(e) => addForm.setData('account_name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_qris" className="text-xs text-white/60">Unggah Gambar QRIS E-Wallet (Optional)</Label>
                            <Input 
                                id="add_qris"
                                type="file"
                                accept="image/*"
                                onChange={(e) => addForm.setData('qris_image', e.target.files ? e.target.files[0] : null)}
                                className="w-full bg-black/40 border-white/10 text-xs cursor-pointer"
                            />
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
                                {addForm.processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. MODAL: EDIT METHOD */}
            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Edit className="text-gold h-5 w-5" />
                            Perbarui Metode Pembayaran
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Perbarui data instansi atau unggah ulang file QRIS.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditMethod} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_name" className="text-xs text-white/60">Nama Bank / HP</Label>
                            <Input 
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_type" className="text-xs text-white/60">Jenis Pembayaran</Label>
                                <select
                                    id="edit_type"
                                    value={editForm.data.type}
                                    onChange={(e) => editForm.setData('type', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                                >
                                    <option value="bank">Bank Transfer</option>
                                    <option value="ewallet">E-Wallet</option>
                                    <option value="custom">Kustom Lainnya</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_number" className="text-xs text-white/60">No. Rekening / No. HP</Label>
                                <Input 
                                    id="edit_number"
                                    value={editForm.data.account_number}
                                    onChange={(e) => editForm.setData('account_number', e.target.value)}
                                    className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_acc_name" className="text-xs text-white/60">Atas Nama Penerima</Label>
                            <Input 
                                id="edit_acc_name"
                                value={editForm.data.account_name}
                                onChange={(e) => editForm.setData('account_name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_qris" className="text-xs text-white/60">Ganti / Unggah Gambar QRIS E-Wallet (Optional)</Label>
                            <Input 
                                id="edit_qris"
                                type="file"
                                accept="image/*"
                                onChange={(e) => editForm.setData('qris_image', e.target.files ? e.target.files[0] : null)}
                                className="w-full bg-black/40 border-white/10 text-xs cursor-pointer"
                            />
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
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Pembayaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 3. MODAL: DELETE METHOD */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 animate-bounce">
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Hapus Metode Pembayaran?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin ingin menghapus metode pembayaran <strong>{selectedMethod?.name}</strong> secara permanen?
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
                            onClick={handleDeleteMethod}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 4. MODAL: PREVIEW QRIS */}
            <Dialog open={openQrisModal} onOpenChange={setOpenQrisModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-lg font-bold text-white flex gap-1.5 items-center justify-center">
                            <QrCode className="h-5 w-5 text-gold" /> Scan QRIS Akomodasi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            QRIS Aktif Penerimaan Sewa: <strong>{selectedMethod?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMethod?.qris_image_path && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 p-4 bg-white flex items-center justify-center">
                            <img
                                src={selectedMethod.qris_image_path}
                                alt="QRIS"
                                className="h-64 w-64 object-contain"
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-4 border-t border-white/5 mt-4 flex justify-end gap-2 w-full">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpenQrisModal(false)}
                            className="bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold px-6 mx-auto"
                        >
                            Tutup Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
