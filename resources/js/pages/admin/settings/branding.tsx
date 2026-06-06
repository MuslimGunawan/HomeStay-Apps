import { Head, useForm } from '@inertiajs/react';
import { 
    Settings, 
    Save, 
    Sparkles, 
    Upload, 
    Lock, 
    HelpCircle,
    Building,
    PhoneCall,
    Mail,
    MapPin,
    Instagram,
    Github
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DragDropUpload from '@/components/DragDropUpload';

interface SettingsData {
    homestay_name: string;
    logo: string;
    favicon: string;
    watermark_text: string;
    copy_watermark: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
    github: string;
}

interface BrandingProps {
    settings: SettingsData;
}

export default function BrandingSettings({ settings }: BrandingProps) {
    const form = useForm({
        homestay_name: settings.homestay_name,
        logo: null as File | null,
        favicon: null as File | null,
        watermark_text: settings.watermark_text,
        copy_watermark: settings.copy_watermark,
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        instagram: settings.instagram || '',
        github: settings.github || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        form.post(route('admin.settings.branding.update'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Pengaturan branding dan proteksi media berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui pengaturan branding.');
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-3xl mx-auto text-left">
            <Head title="Pengaturan Branding & Proteksi" />

            {/* Title Header */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Administrator</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Branding & Proteksi Media</h1>
                <p className="text-sm text-muted-foreground">Sesuaikan identitas penginapan Yuri-HomeStay, logo digital, and parameter keamanan anti-copas media.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border border-white/5 bg-[#0f0f0f] rounded-3xl overflow-hidden p-8 shadow-2xl space-y-6">
                    <CardContent className="space-y-6 p-0">
                        {/* 1. BRAND IDENTITY SECTION */}
                        <div className="space-y-4">
                            <h3 className="font-outfit text-sm font-bold text-gold uppercase tracking-wider flex gap-1.5 items-center">
                                <Building className="h-4 w-4" /> Identitas Dasar Homestay
                            </h3>

                            <div className="space-y-1.5">
                                <Label htmlFor="homestay_name" className="text-xs text-white/60">Nama Homestay Utama (Global)</Label>
                                <Input 
                                    id="homestay_name"
                                    value={form.data.homestay_name}
                                    onChange={(e) => form.setData('homestay_name', e.target.value)}
                                    className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                    placeholder="Cth: Yuri-HomeStay"
                                />
                                {form.errors.homestay_name && <span className="text-[10px] text-rose-400">{form.errors.homestay_name}</span>}
                            </div>
                        </div>

                        {/* 2. CONTACT INFO & SOCIAL MEDIA SECTION */}
                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <h3 className="font-outfit text-sm font-bold text-gold uppercase tracking-wider flex gap-1.5 items-center">
                                <PhoneCall className="h-4 w-4" /> Kontak & Media Sosial
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs text-white/60">Nomor Telepon / WhatsApp</Label>
                                    <Input 
                                        id="phone"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        placeholder="Cth: 0852-6001-4053"
                                    />
                                    {form.errors.phone && <span className="text-[10px] text-rose-400">{form.errors.phone}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs text-white/60">Email Kontak</Label>
                                    <Input 
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        placeholder="Cth: yurihomestay@gmail.com"
                                    />
                                    {form.errors.email && <span className="text-[10px] text-rose-400">{form.errors.email}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="instagram" className="text-xs text-white/60">Instagram URL</Label>
                                    <Input 
                                        id="instagram"
                                        value={form.data.instagram}
                                        onChange={(e) => form.setData('instagram', e.target.value)}
                                        className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        placeholder="Cth: https://instagram.com/yurihomestay"
                                    />
                                    {form.errors.instagram && <span className="text-[10px] text-rose-400">{form.errors.instagram}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="github" className="text-xs text-white/60">GitHub URL</Label>
                                    <Input 
                                        id="github"
                                        value={form.data.github}
                                        onChange={(e) => form.setData('github', e.target.value)}
                                        className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        placeholder="Cth: https://github.com/username/project"
                                    />
                                    {form.errors.github && <span className="text-[10px] text-rose-400">{form.errors.github}</span>}
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                    <Label htmlFor="address" className="text-xs text-white/60">Alamat Fisik Homestay</Label>
                                    <textarea
                                        id="address"
                                        rows={2}
                                        value={form.data.address}
                                        onChange={(e) => form.setData('address', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                                        placeholder="Cth: 54JC+JV2, Mns Mesjid, Kec. Muara Dua, Lhokseumawe, Aceh"
                                    ></textarea>
                                    {form.errors.address && <span className="text-[10px] text-rose-400">{form.errors.address}</span>}
                                </div>
                            </div>
                        </div>

                        {/* 2. IMAGE ASSETS SECTION */}
                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <h3 className="font-outfit text-sm font-bold text-gold uppercase tracking-wider flex gap-1.5 items-center">
                                <Sparkles className="h-4 w-4" /> Asset Digital & Logo
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 bg-black/25 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <Label className="text-xs text-white/60 block font-bold mb-2">Logo Website Utama</Label>
                                        {settings.logo && (
                                            <div className="h-10 max-w-[120px] rounded-lg overflow-hidden bg-black/50 p-2 border border-white/10 flex items-center justify-center shrink-0 mb-3">
                                                <img src={settings.logo} alt="Logo" className="h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <DragDropUpload 
                                        onChange={(file) => form.setData('logo', file)}
                                        value={form.data.logo}
                                        accept="image/*"
                                        maxSizeMB={5}
                                        placeholderText="Drag & drop logo baru di sini"
                                    />
                                    {form.errors.logo && <span className="text-[10px] text-rose-400">{form.errors.logo}</span>}
                                </div>

                                <div className="space-y-3 bg-black/25 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <Label className="text-xs text-white/60 block font-bold mb-2">Icon / Favicon Browser</Label>
                                        {settings.favicon && (
                                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0 mb-3">
                                                <img src={settings.favicon} alt="Favicon" className="h-6 w-6 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <DragDropUpload 
                                        onChange={(file) => form.setData('favicon', file)}
                                        value={form.data.favicon}
                                        accept="image/*"
                                        maxSizeMB={1}
                                        placeholderText="Drag & drop favicon baru di sini"
                                    />
                                    {form.errors.favicon && <span className="text-[10px] text-rose-400">{form.errors.favicon}</span>}
                                </div>
                            </div>
                        </div>

                        {/* 3. MEDIA PROTECTION & ANTI-THEFT */}
                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <h3 className="font-outfit text-sm font-bold text-gold uppercase tracking-wider flex gap-1.5 items-center">
                                <Lock className="h-4 w-4" /> Proteksi Hak Cipta Konten & Media
                            </h3>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
                                Atur parameter watermarking dinamis pada berkas gambar properti and video walkthrough yang diunggah pemilik, serta text append watermarking ketika tamu menyalin deskripsi homestay.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="watermark_text" className="text-xs text-white/60">Teks Watermark Gambar (GD Library)</Label>
                                    <Input 
                                        id="watermark_text"
                                        value={form.data.watermark_text}
                                        onChange={(e) => form.setData('watermark_text', e.target.value)}
                                        className="w-full bg-black/40 border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold"
                                        placeholder="Cth: HOMESTAY-APPS"
                                    />
                                    {form.errors.watermark_text && <span className="text-[10px] text-rose-400">{form.errors.watermark_text}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="copy_watermark" className="text-xs text-white/60">Teks Keterangan Sumber Copas Website</Label>
                                    <textarea
                                        id="copy_watermark"
                                        rows={3}
                                        value={form.data.copy_watermark}
                                        onChange={(e) => form.setData('copy_watermark', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none"
                                        placeholder="Cth: Salinan resmi dari HomeStay-Apps. Baca selengkapnya di: "
                                    ></textarea>
                                    {form.errors.copy_watermark && <span className="text-[10px] text-rose-400">{form.errors.copy_watermark}</span>}
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <div className="flex justify-end pt-6 border-t border-white/5">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-gold hover:bg-white text-black font-bold text-xs px-8 py-5 rounded-xl flex gap-1.5 items-center active:scale-95 shadow-xl hover:scale-103"
                        >
                            <Save className="h-4 w-4" /> {form.processing ? 'Menyimpan...' : 'Perbarui Pengaturan Branding'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
}
