import { Head, useForm } from '@inertiajs/react';
import { 
    Settings, 
    Save, 
    Sparkles, 
    Upload, 
    Lock, 
    HelpCircle,
    Building
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsData {
    homestay_name: string;
    logo: string;
    favicon: string;
    watermark_text: string;
    copy_watermark: string;
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

                        {/* 2. IMAGE ASSETS SECTION */}
                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <h3 className="font-outfit text-sm font-bold text-gold uppercase tracking-wider flex gap-1.5 items-center">
                                <Sparkles className="h-4 w-4" /> Asset Digital & Logo
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 bg-black/25 p-4 rounded-xl border border-white/5">
                                    <Label className="text-xs text-white/60 block font-bold">Logo Website Utama</Label>
                                    {settings.logo && (
                                        <div className="h-10 max-w-[120px] rounded-lg overflow-hidden bg-black/50 p-2 border border-white/10 flex items-center justify-center shrink-0">
                                            <img src={settings.logo} alt="Logo" className="h-full object-contain" />
                                        </div>
                                    )}
                                    <Input 
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => form.setData('logo', e.target.files ? e.target.files[0] : null)}
                                        className="w-full bg-black/40 border-white/10 text-xs cursor-pointer"
                                    />
                                    {form.errors.logo && <span className="text-[10px] text-rose-400">{form.errors.logo}</span>}
                                </div>

                                <div className="space-y-3 bg-black/25 p-4 rounded-xl border border-white/5">
                                    <Label className="text-xs text-white/60 block font-bold">Icon / Favicon Browser</Label>
                                    {settings.favicon && (
                                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                                            <img src={settings.favicon} alt="Favicon" className="h-6 w-6 object-contain" />
                                        </div>
                                    )}
                                    <Input 
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => form.setData('favicon', e.target.files ? e.target.files[0] : null)}
                                        className="w-full bg-black/40 border-white/10 text-xs cursor-pointer"
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
