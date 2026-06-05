import { useState, useRef, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LuxuryLayout from '@/layouts/LuxuryLayout';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Compass, Shield, Sparkles, HelpCircle, ChevronDown, Hotel } from 'lucide-react';

interface Media {
    id: number;
    file_path: string;
    type: string;
    category: string;
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
    latitude: number;
    longitude: number;
    media: Media[];
    reviews_count: number;
    average_rating: number;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    guest: {
        name: string;
        avatar?: string;
    };
    homestay: {
        name: string;
    };
}

interface WelcomeProps {
    featuredHomestays: (Homestay & { category?: string })[];
    reviews?: Review[];
}

export default function Welcome({ featuredHomestays = [], reviews = [] }: WelcomeProps) {
    const { name } = usePage().props as any;
    const siteName = name || 'Yuri-HomeStay';

    const categories = Array.from(new Set(featuredHomestays.map(room => room.category).filter(Boolean))) as string[];

    const [searchParams, setSearchParams] = useState({
        city: '',
        guests: 1,
    });

    const guestDropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const roomDropdownRef = useRef<HTMLDivElement>(null);
    const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
                setRoomDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/explore', searchParams);
    };

    // 3D Card Tilt state & handler for interactive homestay cards
    const [tiltStyles, setTiltStyles] = useState<{ [key: number]: string }>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 10; // Max 10 deg tilt
        const rotateX = -((y - centerY) / centerY) * 10;

        setTiltStyles((prev) => ({
            ...prev,
            [cardId]: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.02)`,
        }));
    };

    const handleMouseLeave = (cardId: number) => {
        setTiltStyles((prev) => ({
            ...prev,
            [cardId]: 'rotateY(0deg) rotateX(0deg) scale(1)',
        }));
    };

    // Parallax scroll for hero background
    const { scrollY } = useScroll();
    const yHeroBg1 = useTransform(scrollY, [0, 500], [0, 150]);
    const yHeroBg2 = useTransform(scrollY, [0, 500], [0, -100]);

    return (
        <LuxuryLayout>
            <Head title="Booking Kamar Premium & Eksklusif" />

            {/* 1. HERO SECTION WITH GLOWING RADIAL AND HUGE BANNER */}
            <section className="relative flex flex-col items-center justify-center py-24 lg:py-36">
                {/* Background glowing highlights with Framer Motion Parallax */}
                <motion.div 
                    style={{ y: yHeroBg1 }}
                    className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[150px] pointer-events-none"
                />
                <motion.div 
                    style={{ y: yHeroBg2 }}
                    className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none"
                />

                <div className="relative mx-auto max-w-5xl px-6 text-center space-y-6 md:px-8">
                    {/* Slogan */}
                    <span className="block font-outfit text-xs md:text-sm font-bold text-gold tracking-widest uppercase mb-1">
                        Yuri Homestay — Kehangatan Rumah, Kemewahan Hotel
                    </span>

                    {/* Bold stunning header typography */}
                    <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                        Temukan Ketenangan Mewah <br />
                        di <span className="bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">{siteName}</span> Anda
                    </h1>

                    {/* Subtitle description */}
                    <p className="mx-auto max-w-2xl text-sm md:text-base text-white/50 leading-relaxed">
                        Nikmati kemewahan staycation terkurasi dengan arsitektur premium, pemandangan alam memukau, dan kalender booking instan terjamin aman.
                    </p>

                    {/* Daily Welcome Quote */}
                    {(() => {
                        const DAILY_QUOTES = [
                            "Kenyamanan istirahat terbaik dimulai dari kualitas kasur dan kebersihan kamar kami.",
                            "Kemewahan bukanlah tentang apa yang Anda sewa, melainkan tentang bagaimana Anda menikmatinya.",
                            "Di Yuri Homestay, setiap sudut kamar dirancang untuk menciptakan ketenangan menginap yang abadi.",
                            "Temukan ketenangan jiwa dalam balutan kehangatan pelayanan kamar kami.",
                            "Kamar yang nyaman adalah awal dari istirahat berkualitas Anda hari ini.",
                            "Menyajikan kesempurnaan istirahat kamar di tengah keindahan Lhokseumawe.",
                            "Istirahat terbaik adalah saat Anda dikelilingi oleh ketenangan kamar yang nyaman dan bersih."
                        ];
                        const dailyQuote = DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];
                        return (
                            <div className="mx-auto max-w-lg bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl backdrop-blur-sm animate-in fade-in duration-700">
                                <span className="block text-[8px] font-bold text-gold/60 uppercase tracking-widest mb-1">Sambutan Hari Ini</span>
                                <p className="text-xs text-white/70 italic font-medium leading-relaxed font-sans">
                                    "{dailyQuote}"
                                </p>
                            </div>
                        );
                    })()}

                    {/* 2. ADVANCED INTERACTIVE FLOATING SEARCH BAR */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mx-auto mt-12 flex flex-col md:flex-row items-center gap-4 bg-deep-charcoal/80 border border-white/10 p-4 rounded-3xl shadow-2xl max-w-4xl backdrop-blur-xl md:rounded-full"
                    >
                        {/* Room category filter */}
                        <div className="relative flex w-full items-center space-x-3 px-4 py-2 border-b border-white/5 md:border-b-0 md:border-r border-white/10" ref={roomDropdownRef}>
                            <Hotel className="h-5 w-5 text-gold shrink-0" />
                            <div className="text-left w-full cursor-pointer select-none" onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest cursor-pointer">Kategori Kamar</label>
                                <div className="flex items-center justify-between w-full text-sm font-semibold text-white mt-0.5">
                                    <span className="line-clamp-1">{searchParams.city ? `Kamar ${searchParams.city}` : 'Semua Kategori Kamar'}</span>
                                    <ChevronDown className={`h-4 w-4 text-gold/60 transition-transform duration-300 ${roomDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Custom Dropdown Content */}
                            {roomDropdownOpen && (
                                <div className="absolute top-[calc(100%+16px)] left-0 z-50 w-full min-w-[240px] bg-deep-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchParams({ ...searchParams, city: '' });
                                                setRoomDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                searchParams.city === ''
                                                    ? 'bg-gold text-deep-black'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            Semua Kategori Kamar
                                        </button>
                                        {categories.map((catName) => (
                                            <button
                                                key={catName}
                                                type="button"
                                                onClick={() => {
                                                    setSearchParams({ ...searchParams, city: catName });
                                                    setRoomDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                    searchParams.city === catName
                                                        ? 'bg-gold text-deep-black'
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                Kamar {catName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guest number */}
                        <div className="relative flex w-full items-center space-x-3 px-4 py-2" ref={guestDropdownRef}>
                            <Users className="h-5 w-5 text-gold shrink-0" />
                            <div className="text-left w-full cursor-pointer select-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest cursor-pointer">Jumlah Tamu</label>
                                <div className="flex items-center justify-between w-full text-sm font-semibold text-white mt-0.5">
                                    <span>{searchParams.guests} Tamu</span>
                                    <ChevronDown className={`h-4 w-4 text-gold/60 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Custom Dropdown Content */}
                            {dropdownOpen && (
                                <div className="absolute top-[calc(100%+16px)] left-0 z-50 w-full min-w-[200px] bg-deep-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => {
                                                    setSearchParams({ ...searchParams, guests: num });
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                    searchParams.guests === num
                                                        ? 'bg-gold text-deep-black'
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                {num} Tamu
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Action CTA Button */}
                        <button
                            type="submit"
                            className="w-full md:w-auto shrink-0 flex items-center justify-center space-x-2 bg-gold hover:bg-white text-deep-black font-bold py-4 px-8 rounded-2xl md:rounded-full transition-all duration-300 transform active:scale-95 shadow-xl hover:scale-105"
                        >
                            <Search className="h-4 w-4" />
                            <span>Cari Kamar</span>
                        </button>
                    </form>
                </div>
            </section>

            {/* 3. VALUE PROPOSITIONS SECTION */}
            <section className="py-16 bg-[#080808]">
                <div className="mx-auto max-w-7xl px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center space-y-3 p-6 bg-deep-charcoal/30 border border-white/5 rounded-2xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                <Compass className="h-6 w-6" />
                            </div>
                            <h3 className="font-outfit text-lg font-bold text-white">Pilihan Kamar Terkurasi</h3>
                            <p className="text-xs text-white/40 leading-relaxed">Pilihan tipe kamar mewah dengan standar kebersihan, estetika visual, dan fasilitas modern terlengkap.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-3 p-6 bg-deep-charcoal/30 border border-white/5 rounded-2xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="font-outfit text-lg font-bold text-white">Booking Aman & Terjamin</h3>
                            <p className="text-xs text-white/40 leading-relaxed">Pencegahan pemesanan tanggal ganda melalui integrasi locking database transaksi real-time.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-3 p-6 bg-deep-charcoal/30 border border-white/5 rounded-2xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="font-outfit text-lg font-bold text-white">Auto-Register On Checkout</h3>
                            <p className="text-xs text-white/40 leading-relaxed">Tidak perlu ribet daftar di awal. Akun otomatis aktif instan saat melakukan reservasi stay.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FEATURED POPULAR PROPERTIES (GRID + 3D CARDS) */}
            <section className="py-24 mx-auto max-w-7xl px-6 md:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12">
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Rekomendasi Terbaik</span>
                        <h2 className="font-outfit text-3xl font-extrabold text-white md:text-4xl">Homestay Terpopuler Saat Ini</h2>
                    </div>
                    <Link
                        href="/explore"
                        className="group inline-flex items-center text-xs font-bold text-gold hover:text-white transition-colors mt-4 md:mt-0"
                    >
                        <span>Lihat Semua Homestay</span>
                        <ArrowRight className="ml-1.5 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* 3D Tilt Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredHomestays.map((homestay, idx) => {
                        const primaryMedia = homestay.media.find(m => m.is_primary) || homestay.media[0];
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                key={homestay.id}
                                className="tilt-card-container cursor-pointer perspective-1000"
                                onMouseMove={(e) => handleMouseMove(e, homestay.id)}
                                onMouseLeave={() => handleMouseLeave(homestay.id)}
                            >
                                <Link
                                    href={`/homestays/${homestay.slug}`}
                                    className="block tilt-card bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-xl transition-transform duration-200 ease-out will-change-transform hover:border-white/10"
                                    style={{ transform: tiltStyles[homestay.id] || 'rotateY(0deg) rotateX(0deg) scale(1)' }}
                                >
                                    {/* Cover Facade Cover with Soft Dark Fade-Out Gradient */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                                        <img
                                            src={primaryMedia?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                                            alt={homestay.name}
                                            className="h-full w-full object-cover transition-transform duration-700 no-select-img draggable-false hover:scale-105"
                                            draggable="false"
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"></div>
                                        
                                        {/* Dynamic Rating badge */}
                                        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-gold">
                                            <Star className="h-3 w-3 fill-gold" />
                                            <span>{homestay.average_rating.toFixed(1)} ({homestay.reviews_count})</span>
                                        </div>

                                        {/* City tag */}
                                        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-gold text-deep-black px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-outfit">
                                            <MapPin className="h-2.5 w-2.5" />
                                            <span>{homestay.city}</span>
                                        </div>
                                    </div>

                                    {/* Info text fields */}
                                    <div className="p-6 space-y-4 text-left">
                                        <div className="space-y-1.5">
                                            <h3 className="font-outfit text-lg font-bold text-white line-clamp-1 hover:text-gold transition-colors">
                                                {homestay.name}
                                            </h3>
                                            <p className="flex items-center text-[10px] text-gold font-bold">
                                                <MapPin className="h-3.5 w-3.5 text-gold mr-1 shrink-0" />
                                                {homestay.address}
                                            </p>
                                            <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                                                {homestay.description}
                                            </p>
                                        </div>

                                        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                                            <div className="text-left">
                                                <span className="block text-[8px] font-bold uppercase tracking-wider text-white/30">Mulai dari</span>
                                                <span className="text-base font-extrabold text-gold font-outfit">
                                                    Rp {parseFloat(homestay.price_per_night as any).toLocaleString('id-ID')}
                                                    <span className="text-[10px] font-normal text-white/50">/mlm</span>
                                                </span>
                                            </div>

                                            <div
                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-gold hover:text-deep-black hover:scale-105 active:scale-95"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* 5. PREMIUM LOCATION & INTERACTIVE GMAPS SECTION */}
            <section className="py-24 mx-auto max-w-7xl px-6 md:px-8 border-t border-white/5">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Left side: Address and landmark timings */}
                    <div className="w-full lg:w-1/2 space-y-6 text-left">
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Akses Properti</span>
                            <h2 className="font-outfit text-3xl font-extrabold text-white md:text-4xl">Lokasi & Akses Yuri-HomeStay</h2>
                            <p className="text-xs text-white/50 leading-relaxed">
                                Terletak di lokasi yang sangat strategis di pusat kota Lhokseumawe, Yuri-HomeStay memberikan kemudahan akses maksimal menuju berbagai pusat bisnis, kuliner legendaris, dan lokasi wisata alam terpopuler di Aceh Utara.
                            </p>
                        </div>

                        {/* Physical Address details */}
                        <div className="p-6 bg-deep-charcoal/30 border border-white/5 rounded-3xl space-y-3">
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alamat Fisik Penginapan</h4>
                                    <p className="text-xs text-white/60 leading-relaxed">
                                        54JC+JV2, Mns Mesjid, Kec. Muara Dua, Kota Lhokseumawe, Aceh 24355
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Surrounding Landmark Access Timings */}
                        <div className="space-y-4">
                            <h4 className="font-outfit text-xs font-bold uppercase text-gold tracking-wider">Estimasi Waktu Akses Terdekat</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-4 bg-black/40 border border-white/5 rounded-2xl">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold font-outfit text-xs font-bold">2M</span>
                                    <div className="text-left">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/30">Pusat Kota</span>
                                        <span className="text-xs font-bold text-white">Pusat Kota Lhokseumawe</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-black/40 border border-white/5 rounded-2xl">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold font-outfit text-xs font-bold">5M</span>
                                    <div className="text-left">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/30">Wisata Air</span>
                                        <span className="text-xs font-bold text-white">Waduk Pusong Lhokseumawe</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-black/40 border border-white/5 rounded-2xl">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold font-outfit text-xs font-bold">8M</span>
                                    <div className="text-left">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/30">Wisata Pantai</span>
                                        <span className="text-xs font-bold text-white">Pantai Ujong Blang</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-black/40 border border-white/5 rounded-2xl">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold font-outfit text-xs font-bold">1M</span>
                                    <div className="text-left">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/30">Kuliner Lokal</span>
                                        <span className="text-xs font-bold text-white">Sentra Kopi Gayo Lhokseumawe</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Interactive luxury Google Map Iframe */}
                    <div className="w-full lg:w-1/2 aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#111111]">
                        <iframe 
                            src="https://maps.google.com/maps?q=5.17016,97.1215276&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                        />
                        <div className="absolute inset-0 border border-gold/10 rounded-3xl pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* 5.5 TESTIMONIALS / REVIEWS SECTION */}
            <section className="py-24 mx-auto max-w-7xl px-6 md:px-8 border-t border-white/5 text-left bg-black/20">
                <div className="space-y-2 mb-12 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Testimoni Pengunjung</span>
                    <h2 className="font-outfit text-3xl font-extrabold text-white md:text-4xl">Apa Kata Mereka Tentang Kami?</h2>
                    <p className="text-xs text-white/40 max-w-md mx-auto">Ulasan jujur dari tamu-tamu yang telah merasakan kehangatan menginap di Yuri Homestay.</p>
                </div>                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((r) => (
                        <div key={r.id} className="bg-deep-charcoal/30 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl backdrop-blur-xs text-left">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-gold">
                                    {Array.from({ length: r.rating }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-gold shrink-0 text-gold" />
                                    ))}
                                </div>
                                <span className="text-[10px] text-white/30">
                                    {new Date(r.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed font-sans italic">
                                "{r.comment}"
                            </p>
                            <div className="border-t border-white/5 pt-3 flex items-center space-x-3">
                                <div className="h-8 w-8 overflow-hidden rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                    {r.guest.avatar ? (
                                        <img src={r.guest.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <Users className="h-4 w-4 text-gold" />
                                    )}
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-white">{r.guest.name}</span>
                                    <span className="text-[9px] text-gold font-medium line-clamp-1">Menginap di {r.homestay.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. INTERACTIVE FAQ ACCORDION SECTION */}
            <section className="py-24 bg-[#080808]">
                <div className="mx-auto max-w-3xl px-6 md:px-8 text-center space-y-12">
                    <div className="space-y-2">
                        <HelpCircle className="mx-auto h-8 w-8 text-gold animate-bounce" />
                        <h2 className="font-outfit text-3xl font-extrabold text-white">Pertanyaan Umum (FAQ)</h2>
                        <p className="text-xs text-white/40">Jawaban cepat atas pertanyaan seputar pemesanan homestay</p>
                    </div>

                    <div className="space-y-4 text-left">
                        {[
                            {
                                q: 'Bagaimana cara Auto-Register bekerja?',
                                a: 'Anda cukup memilih tanggal sewa, mengisi form checkout nama, email, dan WhatsApp. Begitu tombol diklik, sistem otomatis membuat akun guest, menghasilkan password sementara, serta meng-autologin Anda. Password sementara dapat langsung disalin di halaman tanda terima pemesanan sukses.'
                            },
                            {
                                q: 'Apakah ada pembatalan pemesanan?',
                                a: 'Ya. Anda dapat melakukan pembatalan reservasi melalui dasbor tamu Anda atau mengajukan koordinasi langsung dengan pemilik Homestay menggunakan tombol chat WhatsApp terintegrasi yang tersedia.'
                            },
                            {
                                q: 'Bagaimana cara konfirmasi bukti bayar?',
                                a: 'Unggah foto bukti transfer bank/e-wallet Anda langsung di dasbor tamu. Pemilik Homestay (Host) akan memeriksa bukti tersebut dan melakukan Approval reservasi Anda secara instan.'
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-deep-charcoal/30 border border-white/5 p-6 rounded-2xl">
                                <h4 className="font-outfit font-bold text-white text-sm mb-2">{faq.q}</h4>
                                <p className="text-xs text-white/40 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </LuxuryLayout>
    );
}
