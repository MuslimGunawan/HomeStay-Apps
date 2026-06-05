import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Star, ArrowRight, X, Sparkles, ChevronDown, Hotel } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import LuxuryLayout from '@/layouts/LuxuryLayout';

interface Amenity {
    id: number;
    name: string;
    icon: string;
    description: string;
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
    media: any[];
    average_rating: number;
}

interface ExploreProps {
    results: Homestay[];
    filters: {
        city?: string;
        price_min?: string;
        price_max?: string;
        guests?: string;
        amenities?: string;
    };
    allAmenities: Amenity[];
    categories: string[];
}

export default function Explore({ results = [], filters = {}, allAmenities = [], categories = [] }: ExploreProps) {
    const [city, setCity] = useState(filters.city || '');
    const [priceMin, setPriceMin] = useState(filters.price_min || '');
    const [priceMax, setPriceMax] = useState(filters.price_max || '');
    const [guests, setGuests] = useState(filters.guests || '');
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
        filters.amenities 
            ? filters.amenities.split(',').map(id => parseInt(id))
            : []
    );

    const [showFiltersMobile, setShowFiltersMobile] = useState(false);

    const desktopGuestsDropdownRef = useRef<HTMLDivElement>(null);
    const [desktopGuestsDropdownOpen, setDesktopGuestsDropdownOpen] = useState(false);
    const [mobileGuestsDropdownOpen, setMobileGuestsDropdownOpen] = useState(false);

    const [desktopRoomDropdownOpen, setDesktopRoomDropdownOpen] = useState(false);
    const [mobileRoomDropdownOpen, setMobileRoomDropdownOpen] = useState(false);

    const desktopRoomDropdownRef = useRef<HTMLDivElement>(null);
    const mobileRoomDropdownRef = useRef<HTMLDivElement>(null);
    const mobileGuestsDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (desktopGuestsDropdownRef.current && !desktopGuestsDropdownRef.current.contains(event.target as Node)) {
                setDesktopGuestsDropdownOpen(false);
            }

            if (mobileGuestsDropdownRef.current && !mobileGuestsDropdownRef.current.contains(event.target as Node)) {
                setMobileGuestsDropdownOpen(false);
            }

            if (desktopRoomDropdownRef.current && !desktopRoomDropdownRef.current.contains(event.target as Node)) {
                setDesktopRoomDropdownOpen(false);
            }

            if (mobileRoomDropdownRef.current && !mobileRoomDropdownRef.current.contains(event.target as Node)) {
                setMobileRoomDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAmenityToggle = (id: number) => {
        if (selectedAmenities.includes(id)) {
            setSelectedAmenities(selectedAmenities.filter(item => item !== id));
        } else {
            setSelectedAmenities([...selectedAmenities, id]);
        }
    };

    const applyFilters = () => {
        const params: any = {};

        if (city) {
params.city = city;
}

        if (priceMin) {
params.price_min = priceMin;
}

        if (priceMax) {
params.price_max = priceMax;
}

        if (guests) {
params.guests = guests;
}

        if (selectedAmenities.length > 0) {
            params.amenities = selectedAmenities.join(',');
        }

        router.get('/explore', params);
        setShowFiltersMobile(false);
    };

    const clearFilters = () => {
        setCity('');
        setPriceMin('');
        setPriceMax('');
        setGuests('');
        setSelectedAmenities([]);
        router.get('/explore');
    };

    // 3D Card Tilt state
    const [tiltStyles, setTiltStyles] = useState<{ [key: number]: string }>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 10;
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

    return (
        <LuxuryLayout>
            <Head title="Cari Kamar & Tipe Kamar Terkurasi" />

            <div className="mx-auto max-w-7xl w-full px-6 py-12 md:px-8">
                {/* Header title */}
                <div className="mb-10 text-left">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest font-outfit">Eksplorasi Kamar</span>
                    <h1 className="font-outfit text-3xl font-extrabold text-white sm:text-4xl mt-1">Cari Kamar Pilihan</h1>
                    <p className="text-xs text-white/40 mt-1">Dapatkan kamar ternyaman sesuai dengan kebutuhan liburan Anda</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* 1. FILTER SIDEBAR (DESKTOP) */}
                    <aside className="hidden lg:block w-72 shrink-0 space-y-6 bg-deep-charcoal/30 border border-white/5 p-6 rounded-3xl h-fit">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <span className="flex items-center font-outfit font-bold text-white text-sm">
                                <Filter className="mr-2 h-4 w-4 text-gold" />
                                Filter Pencarian
                            </span>
                            <button
                                onClick={clearFilters}
                                className="text-[10px] font-bold text-gold hover:text-white transition-colors"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Room selection */}
                        <div className="relative space-y-2 text-left" ref={desktopRoomDropdownRef}>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Kategori Kamar</label>
                            <div
                                onClick={() => setDesktopRoomDropdownOpen(!desktopRoomDropdownOpen)}
                                className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white cursor-pointer select-none"
                            >
                                <span className="line-clamp-1">{city ? `Kamar ${city}` : 'Semua Kategori Kamar'}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-gold/60 transition-transform duration-300 ${desktopRoomDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown panel */}
                            {desktopRoomDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-deep-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCity('');
                                                setDesktopRoomDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                city === ''
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
                                                    setCity(catName);
                                                    setDesktopRoomDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                    city === catName
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

                        {/* Price range */}
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Rentang Harga (Rp)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-gold focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Guests selection */}
                        <div className="relative space-y-2 text-left" ref={desktopGuestsDropdownRef}>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Kapasitas Tamu</label>
                            <div
                                onClick={() => setDesktopGuestsDropdownOpen(!desktopGuestsDropdownOpen)}
                                className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white cursor-pointer select-none"
                            >
                                <span>{guests ? `Minimal ${guests} Tamu` : 'Semua Kapasitas'}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-gold/60 transition-transform duration-300 ${desktopGuestsDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown panel */}
                            {desktopGuestsDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-deep-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGuests('');
                                                setDesktopGuestsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                guests === ''
                                                    ? 'bg-gold text-deep-black'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            Semua Kapasitas
                                        </button>
                                        {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => {
                                                    setGuests(num.toString());
                                                    setDesktopGuestsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                    guests === num.toString()
                                                        ? 'bg-gold text-deep-black'
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                Minimal {num} Tamu
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Amenities checklist */}
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Fasilitas Kamar</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                {allAmenities.map((amenity) => (
                                    <label key={amenity.id} className="flex items-center space-x-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity.id)}
                                            onChange={() => handleAmenityToggle(amenity.id)}
                                            className="rounded border-white/20 bg-black text-gold focus:ring-gold focus:ring-offset-black accent-gold"
                                        />
                                        <span className="text-[11px] text-white/60 hover:text-white transition-colors">{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="w-full bg-gold text-deep-black font-bold text-xs py-3 rounded-xl transition-all hover:bg-white active:scale-95"
                        >
                            Terapkan Filter
                        </button>
                    </aside>

                    {/* 2. MOBILE FILTER TOGGLE */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <button
                            onClick={() => setShowFiltersMobile(true)}
                            className="flex items-center bg-deep-charcoal border border-white/10 px-4 py-2.5 rounded-full text-xs font-bold text-white hover:border-gold"
                        >
                            <Filter className="mr-2 h-4 w-4 text-gold" />
                            Filter & Cari ({results.length} Stay)
                        </button>

                        <button
                            onClick={clearFilters}
                            className="text-xs font-bold text-gold"
                        >
                            Reset
                        </button>
                    </div>

                    {/* 3. SEARCH RESULTS LISTING */}
                    <div className="flex-1">
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-deep-charcoal/10 border border-white/5 rounded-3xl">
                                <Sparkles className="h-10 w-10 text-gold animate-pulse" />
                                <h3 className="font-outfit text-lg font-bold text-white">Tidak Ada Homestay Ditemukan</h3>
                                <p className="text-xs text-white/40 max-w-sm">Coba sesuaikan kata kunci lokasi, rentang harga, atau hilangkan beberapa filter fasilitas Anda.</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-white/5 border border-white/10 text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-gold hover:text-deep-black"
                                >
                                    Bersihkan Semua Filter
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {results.map((homestay, idx) => {
                                    const primaryImg = homestay.media.find(m => m.is_primary) || homestay.media[0];

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
                                                className="block tilt-card bg-[#0f0f0f] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-transform duration-200 ease-out will-change-transform"
                                                style={{ transform: tiltStyles[homestay.id] || 'rotateY(0deg) rotateX(0deg) scale(1)' }}
                                            >
                                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">
                                                <img
                                                    src={primaryImg?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                                                    alt={homestay.name}
                                                    className="h-full w-full object-cover no-select-img hover:scale-102 transition-transform duration-500"
                                                    draggable="false"
                                                    onContextMenu={(e) => e.preventDefault()}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
                                                
                                                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold">
                                                    <Star className="h-3 w-3 fill-gold" />
                                                    <span>{homestay.average_rating ? homestay.average_rating.toFixed(1) : '5.0'}</span>
                                                </div>

                                                <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-gold text-deep-black px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-outfit">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    <span>{homestay.city}</span>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-4 text-left">
                                                <div className="space-y-1.5">
                                                    <h3 className="font-outfit text-lg font-bold text-white line-clamp-1">
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
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-gold hover:text-deep-black active:scale-95"
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
                        )}
                    </div>
                </div>

                {/* PREMIUM LOCATION & INTERACTIVE GMAPS SECTION */}
                <section className="py-20 mx-auto max-w-7xl px-6 md:px-8 border-t border-white/5 mt-16">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        {/* Left side: Address and landmark timings */}
                        <div className="w-full lg:w-1/2 space-y-6 text-left">
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Lokasi Kamar</span>
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
            </div>

            {/* 4. MOBILE FILTERS DRAWER MODAL */}
            {showFiltersMobile && (
                <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-deep-charcoal p-6 flex flex-col h-full animate-slide-left shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                            <span className="font-outfit font-bold text-white text-base">Filter Pencarian</span>
                            <button
                                onClick={() => setShowFiltersMobile(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                            {/* Room selection mobile */}
                            <div className="relative space-y-2 text-left" ref={mobileRoomDropdownRef}>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Kategori Kamar</label>
                                <div
                                    onClick={() => setMobileRoomDropdownOpen(!mobileRoomDropdownOpen)}
                                    className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white cursor-pointer select-none"
                                >
                                    <span className="line-clamp-1">{city ? `Kamar ${city}` : 'Semua Kategori Kamar'}</span>
                                    <ChevronDown className={`h-3.5 w-3.5 text-gold/60 transition-transform duration-300 ${mobileRoomDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Dropdown panel */}
                                {mobileRoomDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCity('');
                                                    setMobileRoomDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                    city === ''
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
                                                        setCity(catName);
                                                        setMobileRoomDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                        city === catName
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

                            {/* Price */}
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Rentang Harga</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="relative space-y-2 text-left" ref={mobileGuestsDropdownRef}>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Kapasitas Tamu</label>
                                <div
                                    onClick={() => setMobileGuestsDropdownOpen(!mobileGuestsDropdownOpen)}
                                    className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white cursor-pointer select-none"
                                >
                                    <span>{guests ? `Minimal ${guests} Tamu` : 'Semua'}</span>
                                    <ChevronDown className={`h-3.5 w-3.5 text-gold/60 transition-transform duration-300 ${mobileGuestsDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Dropdown panel */}
                                {mobileGuestsDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGuests('');
                                                    setMobileGuestsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                    guests === ''
                                                        ? 'bg-gold text-deep-black'
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                Semua
                                            </button>
                                            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => {
                                                        setGuests(num.toString());
                                                        setMobileGuestsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                                        guests === num.toString()
                                                            ? 'bg-gold text-deep-black'
                                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    Minimal {num} Tamu
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Fasilitas</label>
                                <div className="space-y-2">
                                    {allAmenities.map((amenity) => (
                                        <label key={amenity.id} className="flex items-center space-x-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedAmenities.includes(amenity.id)}
                                                onChange={() => handleAmenityToggle(amenity.id)}
                                                className="rounded border-white/20 bg-black text-gold accent-gold"
                                            />
                                            <span className="text-[11px] text-white/60">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex gap-3">
                            <button
                                onClick={clearFilters}
                                className="flex-1 bg-white/5 border border-white/10 text-white font-bold text-xs py-3 rounded-xl hover:bg-white/10"
                            >
                                Reset
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 bg-gold text-deep-black font-bold text-xs py-3 rounded-xl hover:bg-white"
                            >
                                Cari Stay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LuxuryLayout>
    );
}
