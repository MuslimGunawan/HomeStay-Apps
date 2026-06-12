import { Head, useForm, router } from '@inertiajs/react';
import { 
    Users, 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    ShieldCheck, 
    Mail, 
    Phone, 
    Key, 
    UserPlus,
    X,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Permission {
    id: number;
    name: string;
    slug: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    permissions: Permission[];
    bookings_count?: number;
    homestays_count?: number;
    created_at: string;
}

interface UsersProps {
    users: User[];
    allPermissions: Permission[];
}

export default function UsersIndex({ users = [], allPermissions = [] }: UsersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openAccessModal, setOpenAccessModal] = useState(false);

    // Add Form
    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'guest',
        phone: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'guest',
    });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('admin.users.store'), {
            onSuccess: () => {
                toast.success('Pengguna baru berhasil ditambahkan.');
                setOpenAddModal(false);
                addForm.reset();
            },
            onError: () => {
                toast.error('Gagal menambahkan pengguna. Pastikan email unik.');
            }
        });
    };

    const handleEditUser = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
return;
}

        editForm.post(route('admin.users.update', { id: selectedUser.id }), {
            onSuccess: () => {
                toast.success('Data pengguna berhasil diperbarui.');
                setOpenEditModal(false);
            },
            onError: () => {
                toast.error('Gagal memperbarui data pengguna.');
            }
        });
    };

    const handleDeleteUser = () => {
        if (!selectedUser) {
return;
}

        router.post(route('admin.users.delete', { id: selectedUser.id }), {}, {
            onSuccess: () => {
                toast.success('Akun pengguna berhasil dihapus permanen.');
                setOpenDeleteModal(false);
            },
            onError: () => {
                toast.error('Gagal menghapus pengguna.');
            }
        });
    };

    const handleTogglePermission = (permissionId: number) => {
        if (!selectedUser) {
return;
}

        router.post(route('admin.users.toggle-permission', { id: selectedUser.id }), {
            permission_id: permissionId,
        }, {
            onSuccess: () => {
                toast.success('Hak akses host berhasil disesuaikan.');
                // Refresh our local user state reference to keep permissions checked accurately
                const updated = users.find(u => u.id === selectedUser.id);

                if (updated) {
setSelectedUser(updated);
}
            }
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/20 uppercase tracking-widest">Admin</span>;
            case 'host':
                return <span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-[9px] font-bold text-gold border border-gold/20 uppercase tracking-widest">Host</span>;
            default:
                return <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-500/20 uppercase tracking-widest">Guest</span>;
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm)) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Kelola Pengguna" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Administrator</span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Manajemen Akun Pengguna</h1>
                    <p className="text-sm text-muted-foreground">Kelola kredensial guest, host, admin utama, serta konfigurasi izin RBAC host.</p>
                </div>
                <Button 
                    onClick={() => setOpenAddModal(true)}
                    className="bg-gold hover:bg-white text-black font-bold text-xs py-5 px-6 rounded-xl flex gap-2 items-center"
                >
                    <UserPlus className="h-4 w-4" />
                    Tambah Pengguna Baru
                </Button>
            </div>

            {/* Toolbar Search */}
            <div className="relative w-full sm:w-80 mb-6">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input 
                    placeholder="Cari nama, email, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-white/20 focus:border-gold"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f0f0f]">
                <table className="w-full text-xs text-left text-white/70">
                    <thead className="text-[10px] text-white/40 uppercase bg-black/40 border-b border-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-4">Nama Pengguna</th>
                            <th scope="col" className="px-6 py-4">Kontak / Email</th>
                            <th scope="col" className="px-6 py-4">Statistik Aktivitas</th>
                            <th scope="col" className="px-6 py-4">Peran (Role)</th>
                            <th scope="col" className="px-6 py-4 text-right">Aksi Kontrol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-white block">{user.name}</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">Gabung: {formatDate(user.created_at)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="block flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {user.email}</span>
                                    <span className="block text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> 
                                        {user.phone || 'Belum diisi'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'host' && (
                                        <span className="text-white font-medium">{user.homestays_count || 0} Kamar Properti</span>
                                    )}
                                    {user.role === 'guest' && (
                                        <span className="text-white font-medium">{user.bookings_count || 0} Kali Reservasi</span>
                                    )}
                                    {user.role === 'admin' && (
                                        <span className="text-gold font-medium">Platform Master</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {user.role === 'host' && (
                                            <Button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setOpenAccessModal(true);
                                                }}
                                                className="bg-gold/10 hover:bg-gold hover:text-black text-gold text-[10px] font-bold py-1 px-3 rounded-lg flex gap-1 items-center"
                                            >
                                                <Lock className="h-3.5 w-3.5" /> Akses Izin
                                            </Button>
                                        )}

                                        <Button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                editForm.setData({
                                                    name: user.name,
                                                    email: user.email,
                                                    phone: user.phone || '',
                                                    role: user.role,
                                                });
                                                setOpenEditModal(true);
                                            }}
                                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold py-1 px-3 rounded-lg flex gap-1 items-center"
                                        >
                                            <Edit className="h-3.5 w-3.5" /> Edit
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setSelectedUser(user);
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

            {/* 1. MODAL: ADD USER */}
            <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <UserPlus className="text-gold h-5 w-5" />
                            Tambah Pengguna Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Buat akun baru secara manual dengan email, kontak, password, dan peran pengguna sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddUser} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="add_name" className="text-xs text-white/60">Nama Lengkap</Label>
                            <Input 
                                id="add_name"
                                value={addForm.data.name}
                                onChange={(e) => addForm.setData('name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_email" className="text-xs text-white/60">Alamat Email</Label>
                            <Input 
                                id="add_email"
                                type="email"
                                value={addForm.data.email}
                                onChange={(e) => addForm.setData('email', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_password" className="text-xs text-white/60">Katasandi Awal</Label>
                            <Input 
                                id="add_password"
                                type="password"
                                value={addForm.data.password}
                                onChange={(e) => addForm.setData('password', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_phone" className="text-xs text-white/60">Nomor WhatsApp / HP</Label>
                            <Input 
                                id="add_phone"
                                value={addForm.data.phone}
                                onChange={(e) => addForm.setData('phone', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="add_role" className="text-xs text-white/60">Peran Pengguna (Role)</Label>
                            <select
                                id="add_role"
                                value={addForm.data.role}
                                onChange={(e) => addForm.setData('role', e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                            >
                                <option value="guest">Tamu (Guest)</option>
                                <option value="host">Pemilik (Host)</option>
                                <option value="admin">Admin</option>
                            </select>
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
                                {addForm.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. MODAL: EDIT USER */}
            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2">
                            <Edit className="text-gold h-5 w-5" />
                            Perbarui Data Pengguna
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Perbarui kredensial atau edit peran user terpilih.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditUser} className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_name" className="text-xs text-white/60">Nama Lengkap</Label>
                            <Input 
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_email" className="text-xs text-white/60">Alamat Email</Label>
                            <Input 
                                id="edit_email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_phone" className="text-xs text-white/60">Nomor WhatsApp / HP</Label>
                            <Input 
                                id="edit_phone"
                                value={editForm.data.phone}
                                onChange={(e) => editForm.setData('phone', e.target.value)}
                                className="w-full bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_role" className="text-xs text-white/60">Peran Pengguna (Role)</Label>
                            <select
                                id="edit_role"
                                value={editForm.data.role}
                                onChange={(e) => editForm.setData('role', e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                            >
                                <option value="guest">Tamu (Guest)</option>
                                <option value="host">Pemilik (Host)</option>
                                <option value="admin">Admin</option>
                            </select>
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
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 3. MODAL: DELETE USER */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-sm rounded-2xl p-6 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 animate-bounce">
                        <Trash2 className="h-6 w-6" />
                    </div>

                    <DialogHeader className="text-center">
                        <DialogTitle className="font-outfit text-lg font-bold text-white text-center w-full block">Hapus Akun Pengguna?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Apakah Anda yakin ingin menghapus akun <strong>{selectedUser?.name}</strong> secara permanen? Seluruh relasi reservasi atau homestay terkait milik user akan terhapus.
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
                            onClick={handleDeleteUser}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 rounded-xl"
                        >
                            Ya, Hapus Akun
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 4. MODAL: RBAC ACCESS SETTINGS (EXCLUSIVE HOST LISTING CHECKS) */}
            <Dialog open={openAccessModal} onOpenChange={setOpenAccessModal}>
                <DialogContent className="bg-deep-charcoal border border-white/10 text-white max-w-md rounded-2xl p-6 text-left">
                    <DialogHeader>
                        <DialogTitle className="font-outfit text-xl font-bold flex items-center gap-2 text-gold">
                            <ShieldCheck className="h-5 w-5" />
                            Hak Akses Pemilik (RBAC Manager)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Sesuaikan perizinan fitur secara dinamis untuk akun Host: <strong>{selectedUser?.name}</strong>. Toggle centang di bawah untuk merubah izin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-3">
                            {allPermissions.map((permission) => {
                                const hasPermission = selectedUser?.permissions.some(p => p.id === permission.id);

                                return (
                                    <label key={permission.id} className="flex items-start space-x-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-black/60 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={hasPermission || false}
                                            onChange={() => handleTogglePermission(permission.id)}
                                            className="rounded border-white/20 bg-black text-gold focus:ring-gold accent-gold mt-0.5 shrink-0"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-white">{permission.name}</span>
                                            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 block">{permission.slug}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-6 mt-4 border-t border-white/5">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpenAccessModal(false)}
                            className="bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold px-6"
                        >
                            Tutup & Terapkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
