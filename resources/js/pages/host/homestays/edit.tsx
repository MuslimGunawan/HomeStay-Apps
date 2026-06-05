import { Head, useForm, router, usePage } from '@inertiajs/react';
import { 
    Save, 
    ChevronLeft, 
    MapPin, 
    DollarSign, 
    Users, 
    Sparkles, 
    ChevronRight,
    Image as ImageIcon,
    Plus,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Media {
    id: number;
    file_path: string;
    is_primary: boolean;
}

interface Amenity {
    id: number;
    name: string;
    description: string;
}

interface EditProps {
    homestay: {
        id: number;
        name: string;
        description: string;
        address: string;
        city: string;
        price_per_night: number;
        max_guests: number;
        latitude: number;
        longitude: number;
        status: string;
        media: Media[];
        amenities: Amenity[];
        category?: string;
    };
    amenities: Amenity[];
    categories: string[];
}

export default function Edit({ homestay, amenities = [], categories = [] }: EditProps) {
    const { auth } = usePage().props as any;
    const prefix = auth?.user?.role === 'admin' ? 'admin' : 'host';
    const [activeTab, setActiveTab] = useState<'info' | 'amenity' | 'media'>('info');
    const [isCustomCategory, setIsCustomCategory] = useState(
        homestay.category ? !['Deluxe', 'Executive', 'Heritage', 'Family'].includes(homestay.category) && !categories.includes(homestay.category) : false
    );

    const form = useForm({
        name: homestay.name,
        description: homestay.description,
        address: homestay.address,
        city: homestay.city,
        price_per_night: homestay.price_per_night.toString(),
        max_guests: homestay.max_guests.toString(),
        latitude: homestay.latitude?.toString() || '',
        longitude: homestay.longitude?.toString() || '',
        category: homestay.category || '',
        amenities: homestay.amenities.map(a => a.id),
        custom_amenities: [''] as string[],
        primary_image: null as File | null,
        status: homestay.status,
    });

    const addCustomAmenity = () => {
        form.setData('custom_amenities', [...form.data.custom_amenities, '']);
    };

    const removeCustomAmenity = (index: number) => {
        const updated = form.data.custom_amenities.filter((_, i) => i !== index);
        form.setData('custom_amenities', updated.length > 0 ? updated : ['']);
    };

    const handleCustomAmenityChange = (index: number, val: string) => {
        const updated = [...form.data.custom_amenities];
        updated[index] = val;
        form.setData('custom_amenities', updated);
    };

    const handleAmenityToggle = (id: number) => {
        const checked = form.data.amenities.includes(id);

        if (checked) {
            form.setData('amenities', form.data.amenities.filter(item => item !== id));
        } else {
            form.setData('amenities', [...form.data.amenities, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Standard post with spoofing for multipart files
        form.transform((data) => ({
            ...data,
            custom_amenities: data.custom_amenities.filter(item => item.trim() !== ''),
        }));
        
        form.post(route(`${prefix}.homestays.update` as any, { id: homestay.id }), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Detail homestay berhasil diperbarui.');
                form.setData('custom_amenities', ['']); // Reset custom amenities list
            },
            onError: () => {
                toast.error('Gagal memperbarui homestay.');
            }
        });
    };

    const currentPrimary = homestay.media.find(m => m.is_primary);

    return (
        <div className="flex-1 space-y-8 p-8 max-w-4xl mx-auto text-left">
            <Head title={`Edit - ${homestay.name}`} />

            {/* Title Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">
                        {auth?.user?.role === 'admin' ? 'Portal Administrator' : 'Portal Pemilik'}
                    </span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Edit Detail Homestay</h1>
                    <p className="text-sm text-muted-foreground">Perbarui informasi akomodasi, ketersediaan stay, atau ganti foto sampul depan.</p>
                </div>
                <Button 
                    onClick={() => router.get(route(`${prefix}.homestays` as any))}
                    variant="ghost"
                    className="text-white/60 hover:text-white flex gap-1.5 items-center text-xs font-bold"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Kembali
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-2">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all duration-300 ${
                        activeTab === 'info'
                            ? 'bg-gold border-gold text-deep-black scale-105'
                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'
                    }`}
                >
                    1. Info Utama Properti
                </button>
                <button
                    onClick={() => setActiveTab('amenity')}
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all duration-300 ${
                        activeTab === 'amenity'
                            ? 'bg-gold border-gold text-deep-black scale-105'
                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'
                    }`}
                >
                    2. Fasilitas Global
                </button>
                <button
                    onClick={() => setActiveTab('media')}
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all duration-300 ${
                        activeTab === 'media'
                            ? 'bg-gold border-gold text-deep-black scale-105'
                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'
                    }`}
                >
                    3. Foto Sampul Utama
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Card className="border border-white/5 bg-[#0f0f0f] rounded-3xl overflow-hidden p-8 shadow-2xl">
                    <CardContent className="space-y-6 p-0">
                        {/* TAB 1: BASIC INFORMATION */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="name" className="text-xs text-white/60">Nama Kamar / Homestay</Label>
                                        <Input 
                                            id="name"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                        {form.errors.name && <span className="text-[10px] text-rose-400">{form.errors.name}</span>}
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="status" className="text-xs text-white/60">Status Listing Penawaran</Label>
                                        <select
                                            id="status"
                                            value={form.data.status}
                                            onChange={(e) => form.setData('status', e.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                                        >
                                            <option value="active">Aktif / Disewakan</option>
                                            <option value="inactive">Non-Aktif / Tutup Sementara</option>
                                        </select>
                                        {form.errors.status && <span className="text-[10px] text-rose-400">{form.errors.status}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="category" className="text-xs text-white/60">Kategori Kamar</Label>
                                        <select
                                            id="category-select"
                                            value={isCustomCategory ? '__custom__' : form.data.category}
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                if (val === '__custom__') {
                                                    setIsCustomCategory(true);
                                                    form.setData('category', '');
                                                } else {
                                                    setIsCustomCategory(false);
                                                    form.setData('category', val);
                                                }
                                            }}
                                            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {Array.from(new Set(['Deluxe', 'Executive', 'Heritage', 'Family', ...categories])).map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__custom__">Tulis Kustom / Kategori Baru</option>
                                        </select>
                                        {form.errors.category && <span className="text-[10px] text-rose-400">{form.errors.category}</span>}
                                    </div>

                                    {isCustomCategory && (
                                        <div className="space-y-1.5 text-left animate-in fade-in duration-200">
                                            <Label htmlFor="category-custom" className="text-xs text-white/60">Ketik Kategori Baru</Label>
                                            <Input
                                                id="category-custom"
                                                placeholder="Cth: Suite, Cabin, Penthouse..."
                                                value={form.data.category}
                                                onChange={(e) => form.setData('category', e.target.value)}
                                                className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="city" className="text-xs text-white/60">Kota / Kabupaten</Label>
                                        <Input 
                                            id="city"
                                            value={form.data.city}
                                            onChange={(e) => form.setData('city', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                        {form.errors.city && <span className="text-[10px] text-rose-400">{form.errors.city}</span>}
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="address" className="text-xs text-white/60">Alamat Lengkap Properti</Label>
                                        <Input 
                                            id="address"
                                            value={form.data.address}
                                            onChange={(e) => form.setData('address', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                        {form.errors.address && <span className="text-[10px] text-rose-400">{form.errors.address}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="price" className="text-xs text-white/60">Harga Per Malam (Rp)</Label>
                                        <Input 
                                            id="price"
                                            type="number"
                                            value={form.data.price_per_night}
                                            onChange={(e) => form.setData('price_per_night', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                        {form.errors.price_per_night && <span className="text-[10px] text-rose-400">{form.errors.price_per_night}</span>}
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="guests" className="text-xs text-white/60">Kapasitas Maksimal Tamu</Label>
                                        <Input 
                                            id="guests"
                                            type="number"
                                            min="1"
                                            value={form.data.max_guests}
                                            onChange={(e) => form.setData('max_guests', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                        {form.errors.max_guests && <span className="text-[10px] text-rose-400">{form.errors.max_guests}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="latitude" className="text-xs text-white/60">Latitude</Label>
                                        <Input 
                                            id="latitude"
                                            value={form.data.latitude}
                                            onChange={(e) => form.setData('latitude', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <Label htmlFor="longitude" className="text-xs text-white/60">Longitude</Label>
                                        <Input 
                                            id="longitude"
                                            value={form.data.longitude}
                                            onChange={(e) => form.setData('longitude', e.target.value)}
                                            className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <Label htmlFor="desc" className="text-xs text-white/60">Deskripsi Properti</Label>
                                    <textarea
                                        id="desc"
                                        rows={6}
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                                    ></textarea>
                                    {form.errors.description && <span className="text-[10px] text-rose-400">{form.errors.description}</span>}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('amenity')}
                                        className="bg-gold hover:bg-white text-black font-bold text-xs px-6 py-5 rounded-xl flex gap-1 items-center"
                                    >
                                        Selanjutnya <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: AMENITIES */}
                        {activeTab === 'amenity' && (
                            <div className="space-y-6">
                                <div className="space-y-3 text-left">
                                    <Label className="text-xs text-white/60 block font-bold tracking-wider">Fasilitas Standar Global</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/25 p-6 rounded-2xl border border-white/5">
                                        {amenities.map((item) => (
                                            <label key={item.id} className="flex items-center space-x-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.amenities.includes(item.id)}
                                                    onChange={() => handleAmenityToggle(item.id)}
                                                    className="rounded border-white/20 bg-black text-gold focus:ring-gold accent-gold"
                                                />
                                                <span className="text-xs text-white/70 hover:text-white transition-colors">{item.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Amenities Fields */}
                                <div className="space-y-4 text-left border-t border-white/5 pt-6">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-white/60 block font-bold tracking-wider">Tambah Fasilitas Kustom Baru</Label>
                                        <Button
                                            type="button"
                                            onClick={addCustomAmenity}
                                            variant="outline"
                                            className="border-gold/30 text-gold hover:bg-gold/10 text-[10px] font-bold py-1 px-3 rounded-full"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Tambah Kustom
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {form.data.custom_amenities.map((val, idx) => (
                                            <div key={idx} className="flex gap-3 items-center">
                                                <Input 
                                                    placeholder="Cth: Gratis Akun Netflix, Sarapan Pagi Mewah, Alat BBQ Lengkap..."
                                                    value={val}
                                                    onChange={(e) => handleCustomAmenityChange(idx, e.target.value)}
                                                    className="flex-1 bg-black/40 border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:border-gold"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => removeCustomAmenity(idx)}
                                                    className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 p-2.5 h-9 w-9 rounded-xl shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-white/5">
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('info')}
                                        variant="secondary"
                                        className="text-xs font-bold py-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('media')}
                                        className="bg-gold hover:bg-white text-black font-bold text-xs px-6 py-5 rounded-xl flex gap-1 items-center"
                                    >
                                        Selanjutnya <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PRIMARY COVER REPLACEMENT */}
                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                {/* Current Primary Exterior Image Preview */}
                                {currentPrimary && (
                                    <div className="space-y-2 text-left">
                                        <Label className="text-xs text-white/60 block">Foto Sampul Utama Saat Ini</Label>
                                        <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-white/10 bg-black/30">
                                            <img 
                                                src={currentPrimary.file_path} 
                                                alt="Current Sampul" 
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Replace image file input */}
                                <div className="space-y-1.5 text-left bg-gold/5 p-6 rounded-2xl border border-gold/10">
                                    <Label htmlFor="primary" className="text-xs text-white font-bold block">Ganti Foto Utama Sampul Luar (Optional)</Label>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                        Unggah foto baru jika Anda ingin mengganti foto sampul utama tampak depan. Foto lama akan otomatis dihapus permanen. Maksimal 15MB.
                                    </p>
                                    <Input 
                                        id="primary"
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => form.setData('primary_image', e.target.files ? e.target.files[0] : null)}
                                        className="w-full bg-black/40 border-white/10 mt-3 px-4 py-2 rounded-xl text-xs text-white focus:border-gold cursor-pointer"
                                    />
                                    {form.errors.primary_image && <span className="text-[10px] text-rose-400 block mt-1">{form.errors.primary_image}</span>}
                                </div>

                                <div className="flex justify-between pt-6 border-t border-white/5">
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('amenity')}
                                        variant="secondary"
                                        className="text-xs font-bold py-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-gold hover:bg-white text-black font-bold text-xs px-8 py-5 rounded-xl flex gap-1.5 items-center active:scale-95 shadow-xl hover:scale-103"
                                    >
                                        <Save className="h-4 w-4" /> {form.processing ? 'Menyimpan...' : 'Perbarui Homestay Premium'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
