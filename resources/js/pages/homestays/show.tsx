import { Head, Link, router } from '@inertiajs/react';
import { MapPin, Star, Users, Home, Calendar, Wifi, AirVent, Compass, Sparkles, Shield, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2, X, AlertCircle, ChevronDown, Video as VideoIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import LuxuryLayout from '@/layouts/LuxuryLayout';

interface Media {
    id: number;
    file_path: string;
    type: string;
    category: string;
    custom_category?: string;
    is_primary: boolean;
}

interface Amenity {
    id: number;
    name: string;
    icon: string;
    description: string;
}

interface Review {
    id: number;
    guest: {
        name: string;
        avatar?: string;
    };
    rating: number;
    comment: string;
    created_at: string;
}

interface Host {
    name: string;
    phone: string;
    avatar?: string;
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
    latitude: number;
    longitude: number;
    host: Host;
    media: Media[];
    roomMedia?: Media[];
    room_media?: Media[];
    amenities: Amenity[];
    reviews: Review[];
    average_rating: number;
}

interface ShowProps {
    homestay: Homestay;
    bookedDates: string[];
}

export default function Show({ homestay, bookedDates = [] }: ShowProps) {
    const mediaList = homestay.media || [];
    const roomMediaList = homestay.room_media || homestay.roomMedia || [];
    const allMedia = [
        ...mediaList.map(m => ({ ...m, source: 'exterior' })),
        ...roomMediaList.map(m => ({ ...m, source: 'interior' }))
    ];

    const [activeTab, setActiveTab] = useState('all');

    // Extract dynamic categories for filter tabs
    const categories = ['all', 'exterior', 'interior'];
    allMedia.forEach(m => {
        const cat = m.custom_category || m.category;

        if (cat && !categories.includes(cat)) {
            categories.push(cat);
        }
    });

    const filteredMedia = allMedia.filter(m => {
        if (activeTab === 'all') {
return true;
}

        if (activeTab === 'exterior') {
return m.source === 'exterior';
}

        if (activeTab === 'interior') {
return m.source === 'interior';
}

        return m.category === activeTab || m.custom_category === activeTab;
    });

    // Lightbox viewer states
    const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const lightboxSlides = filteredMedia.map(m => {
        if (m.type === 'video') {
            return {
                type: 'video',
                width: 1280,
                height: 720,
                poster: m.file_path, // Fallback if there's a poster
                sources: [
                    {
                        src: m.file_path,
                        type: "video/mp4",
                    }
                ],
            };
        }

        return { src: m.file_path };
    });

    // Booking widget state
    const guestsDropdownRef = useRef<HTMLDivElement>(null);
    const [guestsDropdownOpen, setGuestsDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(event.target as Node)) {
                setGuestsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [bookingDetails, setBookingDetails] = useState({
        check_in: '',
        check_out: '',
        total_guests: 1,
    });

    const [priceCalculations, setPriceCalculations] = useState<{ days: number; total: number } | null>(null);
    const [bookingError, setBookingError] = useState('');

    const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
        const updated = { ...bookingDetails, [field]: value };
        setBookingDetails(updated);

        if (updated.check_in && updated.check_out) {
            const inDate = new Date(updated.check_in);
            const outDate = new Date(updated.check_out);

            // Date validation
            if (inDate >= outDate) {
                setBookingError('Tanggal Check-out harus setelah tanggal Check-in.');
                setPriceCalculations(null);

                return;
            }

            // Check blocked dates
            let hasOverlap = false;
            const current = new Date(inDate);

            while (current <= outDate) {
                const dateStr = current.toISOString().split('T')[0];

                if (bookedDates.includes(dateStr)) {
                    hasOverlap = true;
                    break;
                }

                current.setDate(current.getDate() + 1);
            }

            if (hasOverlap) {
                setBookingError('Maaf, salah satu tanggal dalam rentang pilihan Anda sudah dipesan.');
                setPriceCalculations(null);

                return;
            }

            setBookingError('');
            const days = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
            setPriceCalculations({
                days,
                total: days * parseFloat(homestay.price_per_night as any),
            });
        }
    };

    const proceedToCheckout = () => {
        if (!bookingDetails.check_in || !bookingDetails.check_out) {
            setBookingError('Silakan lengkapi tanggal Check-in dan Check-out Anda.');

            return;
        }

        if (bookingError) {
return;
}

        router.get(`/homestays/${homestay.slug}/checkout`, bookingDetails);
    };

    // WhatsApp dynamic contact link
    const getWhatsAppUrl = () => {
        const phone = (homestay.host?.phone || '').replace(/^0/, '62');
        const text = encodeURIComponent(
            `Halo Kak ${homestay.host?.name || 'Host'}, saya tertarik dengan Homestay "${homestay.name}" di ${homestay.city}. Ingin bertanya ketersediaan kamar...`
        );

        return `https://wa.me/${phone}?text=${text}`;
    };

    return (
        <LuxuryLayout>
            <Head title={`${homestay.name} - Homestay di ${homestay.city}`} />

            <div className="mx-auto max-w-7xl w-full px-6 py-12 md:px-8 space-y-12">
                
                {/* 1. HEADER DESCRIPTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
                    <div className="space-y-3 text-left">
                        <div className="flex items-center space-x-2">
                            <span className="bg-gold text-deep-black text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-outfit">
                                Verified Premium
                            </span>
                            <span className="flex items-center text-xs text-gold font-bold">
                                <Star className="h-4 w-4 fill-gold mr-1" />
                                {(homestay.average_rating ?? 0).toFixed(1)} ({(homestay.reviews || []).length} Ulasan)
                            </span>
                        </div>

                        <h1 className="font-outfit text-3xl font-extrabold text-white md:text-5xl leading-tight">
                            {homestay.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                            <span className="flex items-center">
                                <MapPin className="h-4 w-4 text-gold mr-1.5 shrink-0" />
                                {homestay.address}, {homestay.city}
                            </span>
                            <span className="flex items-center">
                                <Users className="h-4 w-4 text-gold mr-1.5 shrink-0" />
                                Maks. {homestay.max_guests || 0} Tamu
                            </span>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="block text-[10px] font-bold text-white/30 uppercase tracking-widest">Harga per malam</span>
                        <span className="text-3xl font-extrabold text-gold font-outfit">
                            Rp {parseFloat((homestay.price_per_night || 0) as any).toLocaleString('id-ID')}
                            <span className="text-sm font-normal text-white/50">/malam</span>
                        </span>
                    </div>
                </div>

                {/* 2. TABBED Luxury Media Gallery */}
                <section className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-300 ${
                                    activeTab === cat
                                        ? 'bg-gold border-gold text-deep-black scale-105'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'
                                }`}
                            >
                                {cat === 'all' ? 'Semua Foto' : cat === 'exterior' ? 'Halaman Luar' : cat === 'interior' ? 'Kamar Dalam' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Photo Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredMedia.map((media, index) => (
                            <div
                                key={media.id}
                                onClick={() => openLightbox(index)}
                                className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-white/5 ${
                                    index === 0 ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square'
                                }`}
                            >
                                <img
                                    src={media.file_path}
                                    alt="Homestay Area"
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-103 no-select-img"
                                    draggable="false"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                                {media.type === 'video' ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                                            <VideoIcon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Sparkles className="h-6 w-6 text-gold animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. DETAILS & BOOKING WIDGET COLUMNS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
                    {/* Left: About & Amenities */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="font-outfit text-xl font-bold text-white flex items-center">
                                <Home className="mr-2.5 h-5 w-5 text-gold" />
                                Deskripsi Kamar
                            </h3>
                            <p className="text-xs text-white/50 leading-relaxed font-sans whitespace-pre-line">
                                {homestay.description || ''}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-6">
                            <h3 className="font-outfit text-xl font-bold text-white flex items-center">
                                <Sparkles className="mr-2.5 h-5 w-5 text-gold animate-pulse" />
                                Fasilitas Homestay
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {(homestay.amenities || []).map((amenity) => (
                                    <div key={amenity.id} className="flex items-start space-x-3 p-4 bg-deep-charcoal/20 border border-white/5 rounded-2xl">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-white">{amenity.name}</span>
                                            <span className="text-[10px] text-white/40 leading-tight block mt-0.5">{amenity.description || 'Fasilitas premium'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Right: Booking widget */}
                    <div className="space-y-6">
                        <div className="sticky top-28 bg-[#111111] border border-white/10 p-6 rounded-3xl shadow-2xl space-y-6 text-left">
                            <div className="border-b border-white/5 pb-4">
                                <span className="text-xs text-white/50">Mulai menginap mewah</span>
                                <h3 className="font-outfit text-lg font-bold text-white mt-1">Form Reservasi Instan</h3>
                            </div>

                            {/* Booking dates picker */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Tanggal Check-in</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDetails.check_in}
                                        onChange={(e) => handleDateChange('check_in', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none cursor-pointer [color-scheme:dark]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Tanggal Check-out</label>
                                    <input
                                        type="date"
                                        min={bookingDetails.check_in || new Date().toISOString().split('T')[0]}
                                        value={bookingDetails.check_out}
                                        onChange={(e) => handleDateChange('check_out', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:border-gold focus:outline-none cursor-pointer [color-scheme:dark]"
                                    />
                                </div>

                                <div className="relative space-y-1.5" ref={guestsDropdownRef}>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Jumlah Tamu</label>
                                    <div
                                        onClick={() => setGuestsDropdownOpen(!guestsDropdownOpen)}
                                        className="flex items-center justify-between w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs text-white cursor-pointer select-none"
                                    >
                                        <span>{bookingDetails.total_guests} Tamu</span>
                                        <ChevronDown className={`h-3.5 w-3.5 text-gold/60 transition-transform duration-300 ${guestsDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* Dropdown panel */}
                                    {guestsDropdownOpen && (
                                        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                                                {Array.from({ length: homestay.max_guests || 1 }).map((_, idx) => {
                                                    const num = idx + 1;

                                                    return (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => {
                                                                setBookingDetails({ ...bookingDetails, total_guests: num });
                                                                setGuestsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                                bookingDetails.total_guests === num
                                                                    ? 'bg-gold text-deep-black'
                                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                        >
                                                            {num} Tamu
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Booking errors alert */}
                            {bookingError && (
                                <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-[11px] text-red-400">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                                    <span>{bookingError}</span>
                                </div>
                            )}

                            {/* Calculations listing */}
                            {priceCalculations && (
                                <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2 text-xs">
                                    <div className="flex justify-between text-white/50">
                                        <span>Rp {parseFloat((homestay.price_per_night || 0) as any).toLocaleString('id-ID')} x {priceCalculations.days} malam</span>
                                        <span>Rp {priceCalculations.total.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-gold">
                                        <span>Total Biaya Stay</span>
                                        <span>Rp {priceCalculations.total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            )}

                            {/* CTA Action button */}
                            <button
                                onClick={proceedToCheckout}
                                disabled={!!bookingError}
                                className="w-full bg-gold disabled:bg-gold/40 text-deep-black font-bold text-xs py-4 rounded-xl transition-all hover:bg-white active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <Calendar className="h-4 w-4" />
                                <span>Pesan Kamar</span>
                            </button>

                            {/* Secondary contact button via WhatsApp */}
                            <a
                                href={getWhatsAppUrl()}
                                target="_blank"
                                className="w-full border border-white/10 hover:border-gold hover:bg-gold/5 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                            >
                                <Share2 className="h-4 w-4 text-gold" />
                                <span>Hubungi Host via WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 5. VERIFIED GUEST REVIEWS */}
                <section className="border-t border-white/5 pt-12 text-left space-y-8">
                    <h3 className="font-outfit text-xl font-bold text-white flex items-center">
                        <Star className="mr-2.5 h-5 w-5 text-gold fill-gold" />
                        Ulasan Tamu Terverifikasi ({(homestay.reviews || []).length})
                    </h3>

                    {(homestay.reviews || []).length === 0 ? (
                        <p className="text-xs text-white/40">Belum ada ulasan untuk homestay ini. Jadilah tamu pertama yang memberikan ulasan!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {(homestay.reviews || []).map((rev) => (
                                <div key={rev.id} className="bg-deep-charcoal/20 border border-white/5 p-6 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 overflow-hidden rounded-full bg-gold/20 flex items-center justify-center">
                                                {rev.guest?.avatar ? (
                                                    <img src={rev.guest.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                                ) : (
                                                    <Users className="h-5 w-5 text-gold" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold text-white">{rev.guest?.name || 'Tamu'}</span>
                                                <span className="text-[9px] text-white/30">{new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-0.5 text-gold">
                                            {Array.from({ length: rev.rating }).map((_, i) => (
                                                <Star key={i} className="h-3.5 w-3.5 fill-gold shrink-0" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed font-sans">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* 6. LUXURY LIGHTBOX VIEWER */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides as any}
                plugins={[Fullscreen, Slideshow, Thumbnails, Video, Zoom]}
                carousel={{ finite: false }}
                thumbnails={{ position: "bottom", width: 120, height: 80, border: 2, borderRadius: 12, gap: 16 }}
                zoom={{ maxZoomPixelRatio: 3 }}
                styles={{ container: { backgroundColor: "rgba(0, 0, 0, .95)", backdropFilter: "blur(10px)" } }}
            />
        </LuxuryLayout>
    );
}
