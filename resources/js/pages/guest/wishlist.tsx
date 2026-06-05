import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Heart, MapPin, ArrowRight, Compass, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Media {
    id: number;
    file_path: string;
    is_primary: boolean;
}

interface Homestay {
    id: number;
    name: string;
    slug: string;
    description: string;
    address: string;
    city: string;
    price_per_night: number;
    max_guests: number;
    media: Media[];
    average_rating: number;
}

interface WishlistProps {
    wishlist: Homestay[];
}

export default function Wishlist({ wishlist = [] }: WishlistProps) {
    const [tiltStyles, setTiltStyles] = useState<{ [key: number]: string }>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = -((y - centerY) / centerY) * 8;

        setTiltStyles((prev) => ({
            ...prev,
            [cardId]: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.01)`,
        }));
    };

    const handleMouseLeave = (cardId: number) => {
        setTiltStyles((prev) => ({
            ...prev,
            [cardId]: 'rotateY(0deg) rotateX(0deg) scale(1)',
        }));
    };

    const handleRemoveWishlist = (id: number) => {
        router.post(route('guest.wishlist.toggle', { homestayId: id }), {}, {
            onSuccess: () => {
                toast.success('Favorit berhasil dihapus.');
            }
        });
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto text-left">
            <Head title="Favorit Saya" />

            {/* Title block */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Portal Tamu</span>
                <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Kamar Favorit Anda</h1>
                <p className="text-sm text-muted-foreground">Koleksi staycation impian yang telah Anda simpan sebelumnya.</p>
            </div>

            {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <Heart className="h-10 w-10 text-rose-500/40 animate-pulse" />
                    <h4 className="font-bold text-white">Belum Ada Favorit</h4>
                    <p className="text-xs text-muted-foreground max-w-xs">Simpan penginapan impian Anda saat mencari kamar dengan mengklik tombol berbentuk hati.</p>
                    <Button onClick={() => router.get('/explore')} className="bg-gold hover:bg-white text-black font-bold text-xs rounded-full">
                        Eksplorasi Homestay
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlist.map((homestay) => {
                        const primaryImg = homestay.media.find(m => m.is_primary) || homestay.media[0];
                        return (
                            <div
                                key={homestay.id}
                                className="tilt-card-container cursor-pointer perspective-1000"
                                onMouseMove={(e) => handleMouseMove(e, homestay.id)}
                                onMouseLeave={() => handleMouseLeave(homestay.id)}
                            >
                                <Card
                                    className="tilt-card bg-[#0f0f0f] border border-white/5 rounded-3xl overflow-hidden shadow-xl transition-transform duration-200 ease-out will-change-transform flex flex-col h-full"
                                    style={{ transform: tiltStyles[homestay.id] || 'rotateY(0deg) rotateX(0deg) scale(1)' }}
                                >
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5 shrink-0">
                                        <img
                                            src={primaryImg?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                                            alt={homestay.name}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
                                        
                                        {/* Remove from wishlist button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveWishlist(homestay.id);
                                            }}
                                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-rose-500 transition-all hover:bg-rose-500 hover:text-white hover:scale-105 active:scale-95"
                                        >
                                            <Heart className="h-4 w-4 fill-current" />
                                        </button>

                                        {/* Rating */}
                                        <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold">
                                            <Star className="h-3 w-3 fill-gold" />
                                            <span>{homestay.average_rating ? homestay.average_rating.toFixed(1) : '5.0'}</span>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1.5 text-left">
                                            <h3 className="font-outfit text-base font-bold text-white line-clamp-1">
                                                {homestay.name}
                                            </h3>
                                            <p className="flex items-center text-[10px] text-gold font-bold">
                                                <MapPin className="h-3.5 w-3.5 text-gold mr-1 shrink-0" />
                                                {homestay.address}, {homestay.city}
                                            </p>
                                            <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                                                {homestay.description}
                                            </p>
                                        </div>

                                        <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                                            <div className="text-left">
                                                <span className="block text-[8px] font-bold uppercase tracking-wider text-white/30">Mulai dari</span>
                                                <span className="text-sm font-extrabold text-gold font-outfit">
                                                    Rp {parseFloat(homestay.price_per_night as any).toLocaleString('id-ID')}
                                                    <span className="text-[10px] font-normal text-white/50">/mlm</span>
                                                </span>
                                            </div>

                                            <Link
                                                href={`/homestays/${homestay.slug}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-gold hover:text-deep-black active:scale-95 shrink-0"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
