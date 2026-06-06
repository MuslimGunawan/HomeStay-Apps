import { Head, usePage } from '@inertiajs/react';
import { Users, PhoneCall, Calendar, ShieldCheck, MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    total_price: number;
    status: string;
    guest: {
        name: string;
        phone: string;
        email: string;
    };
    homestay: {
        id: number;
        name: string;
    };
}

interface StaysProps {
    stays: Booking[];
}

export default function ActiveStays({ stays = [] }: StaysProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const { auth } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState('');

    const getWhatsAppUrl = (phone: string, guestName: string, homestayName: string) => {
        const cleanedPhone = phone.replace(/^0/, '62');
        const text = encodeURIComponent(
            `Halo Kak ${guestName}, saya Host dari penginapan ${homestayName}. Saya ingin memastikan kenyamanan stay Anda...`
        );

        return `https://wa.me/${cleanedPhone}?text=${text}`;
    };

    const isCurrentlyInStay = (checkIn: string, checkOut: string) => {
        const today = new Date().toISOString().split('T')[0];

        return today >= checkIn && today <= checkOut;
    };

    const filteredStays = stays.filter(s => 
        s.guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.homestay.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Pemantauan Tamu Aktif" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">
                        {auth?.user?.role === 'admin' ? 'Portal Administrator' : 'Portal Pemilik'}
                    </span>
                    <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Monitoring Tamu & Stay</h1>
                    <p className="text-sm text-muted-foreground">Pantau tamu yang sedang menginap (In Stay) hari ini maupun riwayat stay tamu sebelumnya.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input 
                        placeholder="Cari nama tamu, kamar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-white/20 focus:border-gold"
                    />
                </div>
            </div>

            {/* Stays Grid */}
            {filteredStays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <Users className="h-12 w-12 text-gold/40 animate-pulse" />
                    <h4 className="font-bold text-white">Tidak Ada Tamu Terdaftar</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">Tamu dengan pesanan terkonfirmasi (Confirmed) atau selesai (Completed) akan terpantau di sini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStays.map((stay) => {
                        const active = isCurrentlyInStay(stay.check_in, stay.check_out) && stay.status === 'confirmed';

                        return (
                            <Card key={stay.id} className="border border-white/5 bg-[#0f0f0f] p-6 text-left relative overflow-hidden flex flex-col justify-between">
                                {active && (
                                    <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-emerald-500/5 blur-[30px] pointer-events-none"></div>
                                )}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-sm">{stay.guest.name}</h4>
                                                {active ? (
                                                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 uppercase tracking-widest text-[8px] border border-emerald-500/20">In Stay</span>
                                                ) : stay.status === 'completed' ? (
                                                    <span className="rounded bg-white/10 px-2 py-0.5 font-bold text-white/50 uppercase tracking-widest text-[8px] border border-white/10">Selesai</span>
                                                ) : (
                                                    <span className="rounded bg-blue-500/10 px-2 py-0.5 font-bold text-blue-400 uppercase tracking-widest text-[8px] border border-blue-500/20">Confirmed</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{stay.guest.email} | {stay.guest.phone}</p>
                                        </div>
                                        <a
                                            href={getWhatsAppUrl(stay.guest.phone, stay.guest.name, stay.homestay.name)}
                                            target="_blank"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-black transition-colors"
                                        >
                                            <PhoneCall className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-white/40">Unit Homestay</span>
                                            <span className="font-bold text-white">{stay.homestay.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/40">Durasi Stay</span>
                                            <span className="font-semibold text-white flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-gold" />
                                                {formatDate(stay.check_in)} - {formatDate(stay.check_out)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/40">Jumlah Tamu</span>
                                            <span className="font-bold">{stay.total_guests} Orang</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
