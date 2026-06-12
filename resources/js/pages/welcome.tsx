import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Search, MapPin, Users, Star, ArrowRight, Compass, Shield, HelpCircle, ChevronDown, Hotel, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import LuxuryLayout from '@/layouts/LuxuryLayout';

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
    media: Media[];
    reviews_count: number;
    average_rating: number;
    display_status?: string;
    status?: string;
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

interface Scroll3DSectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

function Scroll3DSection({ children, className = '', id }: Scroll3DSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Clean, natural entering transitions without awkward fading-out/scaling-down at the top
    const scale = useTransform(scrollYProgress, [0, 0.2, 1], [0.95, 1, 1]);
    const scrollRotateX = useTransform(scrollYProgress, [0, 0.2, 1], [6, 0, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.1, 1], [0, 1, 1]);
    const y = useTransform(scrollYProgress, [0, 0.2, 1], [35, 0, 0]);

    // Butter-smooth Framer Motion spring mouse tilt values
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const tiltX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), springConfig);
    const tiltY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const valX = (e.clientX - rect.left) / width;
        const valY = (e.clientY - rect.top) / height;
        mouseX.set(valX);
        mouseY.set(valY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div 
            ref={containerRef} 
            id={id} 
            className={`w-full relative overflow-visible ${className}`} 
            style={{ perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{
                    scale,
                    rotateX: scrollRotateX,
                    opacity,
                    y,
                    transformStyle: 'preserve-3d',
                }}
                className="w-full h-full origin-center"
            >
                {/* Mouse-Move Parallax Tilt Container - No CSS transition conflicts! */}
                <motion.div
                    style={{
                        rotateX: tiltX,
                        rotateY: tiltY,
                        transformStyle: 'preserve-3d',
                    }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            </motion.div>
        </div>
    );
}

interface HomestayCardProps {
    homestay: Homestay;
    idx: number;
    isDark: boolean;
    isActive?: boolean;
    onFocus?: () => void;
}

function HomestayCard({ homestay, idx, isDark, isActive = true, onFocus }: HomestayCardProps) {
    const primaryMedia = homestay.media.find(m => m.is_primary) || homestay.media[0];

    // Card-local mouse spring values
    const cardMouseX = useMotionValue(0.5);
    const cardMouseY = useMotionValue(0.5);

    const cardSpringConfig = { damping: 20, stiffness: 150 };
    const cardTiltX = useSpring(useTransform(cardMouseY, [0, 1], [8, -8]), cardSpringConfig);
    const cardTiltY = useSpring(useTransform(cardMouseX, [0, 1], [-8, 8]), cardSpringConfig);
    const cardScale = useSpring(useMotionValue(1), cardSpringConfig);

    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isActive) {
return;
}

        const rect = e.currentTarget.getBoundingClientRect();
        const valX = (e.clientX - rect.left) / rect.width;
        const valY = (e.clientY - rect.top) / rect.height;
        cardMouseX.set(valX);
        cardMouseY.set(valY);
        cardScale.set(1.02);
    };

    const handleCardMouseLeave = () => {
        cardMouseX.set(0.5);
        cardMouseY.set(0.5);
        cardScale.set(1.0);
    };

    const formattedPrice = () => {
        try {
            return parseFloat(homestay.price_per_night as any).toLocaleString('id-ID');
        } catch {
            return homestay.price_per_night;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="tilt-card-container cursor-pointer perspective-1000 w-full"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
        >
            <Link
                href={`/homestays/${homestay.slug}`}
                onClick={(e) => {
                    if (!isActive) {
                        e.preventDefault();
                        e.stopPropagation();
                        onFocus?.();
                    }
                }}
                className={`block border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 select-none group w-full ${
                    isDark 
                        ? 'bg-[#111111] border-white/5 hover:border-white/10' 
                        : 'bg-white border-black/5 hover:border-gold/30 shadow-md'
                }`}
            >
                <motion.div
                    style={{
                        rotateX: isActive ? cardTiltX : 0,
                        rotateY: isActive ? cardTiltY : 0,
                        scale: isActive ? cardScale : 1,
                        transformStyle: 'preserve-3d',
                    }}
                    className="w-full h-full"
                >
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img
                            src={primaryMedia?.file_path || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                            alt={homestay.name}
                            className="h-full w-full object-cover transition-transform duration-700 no-select-img draggable-false group-hover:scale-105"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#111111]' : 'from-white'} via-transparent to-transparent`}></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider font-outfit shadow-lg border border-emerald-400/20">
                                Ready
                            </span>
                        </div>

                        {/* Rating */}
                        <div className={`absolute top-4 right-4 flex items-center space-x-1 backdrop-blur-md border px-3 py-1 rounded-full text-[10px] font-bold ${
                            isDark 
                                ? 'bg-black/75 border-white/10 text-gold' 
                                : 'bg-white/90 border-black/5 text-[#1a1a1a] shadow-xs'
                        }`}>
                            <Star className="h-3 w-3 fill-gold text-gold" />
                            <span>{(homestay.average_rating || 0).toFixed(1)} ({homestay.reviews_count || 0})</span>
                        </div>

                        {/* City */}
                        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-gold text-deep-black px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-outfit">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{homestay.city}</span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-6 space-y-4 text-left" style={{ transform: 'translateZ(30px)' }}>
                        <div className="space-y-1.5">
                            <h3 className={`font-outfit text-lg font-bold line-clamp-1 transition-colors ${
                                isDark ? 'text-white group-hover:text-gold' : 'text-neutral-900 group-hover:text-gold'
                            }`}>
                                {homestay.name}
                            </h3>
                            <p className="flex items-center text-[10px] text-gold font-bold">
                                <MapPin className="h-3.5 w-3.5 text-gold mr-1 shrink-0" />
                                {homestay.address}
                            </p>
                            <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
                                {homestay.description}
                            </p>
                        </div>

                        <div className={`border-t pt-4 flex items-center justify-between ${isDark ? 'border-white/5' : 'border-neutral-200'}`}>
                            <div className="text-left">
                                <span className={`block text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>Mulai dari</span>
                                <span className="text-base font-extrabold text-gold font-outfit">
                                    Rp {formattedPrice()}
                                    <span className={`text-[10px] font-normal ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>/mlm</span>
                                </span>
                            </div>

                            <div className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                                isDark 
                                    ? 'bg-white/5 border-white/10 text-white group-hover:bg-gold group-hover:text-deep-black group-hover:scale-105 active:scale-95' 
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 group-hover:bg-gold group-hover:text-deep-black group-hover:scale-105 active:scale-95 shadow-xs'
                            }`}>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

interface WelcomeProps {
    featuredHomestays: (Homestay & { category?: string })[];
    reviews?: Review[];
}

export default function Welcome({ featuredHomestays = [], reviews = [] }: WelcomeProps) {
    const { name } = usePage().props as any;
    const siteName = name || 'Yuri-HomeStay';

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

    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    // Device responsive layout check
    const [mounted, setMounted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkViewport = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        const timer = setTimeout(() => {
            setMounted(true);
            checkViewport();
        }, 0);
        window.addEventListener('resize', checkViewport);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkViewport);
        };
    }, []);

    // 1. MOBILE / FALLBACK / SSR SCROLL INTERACTIVE STUFF
    const { scrollY } = useScroll();
    const yHeroBg1 = useTransform(scrollY, [0, 500], [0, 150]);
    const yHeroBg2 = useTransform(scrollY, [0, 500], [0, -100]);

    const coverRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: mobileScrollProgress } = useScroll({
        target: coverRef,
        offset: ["start start", "end start"]
    });

    const scale = useTransform(mobileScrollProgress, [0, 1], [1, 0.78]);
    const rotateX = useTransform(mobileScrollProgress, [0, 1], [0, 40]);
    const opacity = useTransform(mobileScrollProgress, [0, 0.95], [1, 0.1]);
    const yTranslate = useTransform(mobileScrollProgress, [0, 1], [0, -100]);
    const visibility = useTransform(mobileScrollProgress, (v) => v >= 0.95 ? 'hidden' : 'visible');
    const pointerEvents = useTransform(mobileScrollProgress, (v) => v >= 0.95 ? 'none' : 'auto');

    const bgScale = useTransform(mobileScrollProgress, [0, 1], [1.0, 1.35]);

    const heroMouseX = useMotionValue(0.5);
    const heroMouseY = useMotionValue(0.5);
    const heroSpringConfig = { damping: 22, stiffness: 100, mass: 0.6 };
    const heroTiltX = useSpring(useTransform(heroMouseY, [0, 1], [6, -6]), heroSpringConfig);
    const heroTiltY = useSpring(useTransform(heroMouseX, [0, 1], [-6, 6]), heroSpringConfig);

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const valX = (e.clientX - rect.left) / rect.width;
        const valY = (e.clientY - rect.top) / rect.height;
        heroMouseX.set(valX);
        heroMouseY.set(valY);
    };

    const handleHeroMouseLeave = () => {
        heroMouseX.set(0.5);
        heroMouseY.set(0.5);
    };

    // 2. DESKTOP CINEMATIC SCROLLYTELLING STUFF
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: rawScrollProgress } = useScroll();

    // Smoothed scroll progression track using a high-frequency elastic spring
    const scrollSpring = useSpring(rawScrollProgress, {
        stiffness: 45,
        damping: 20,
        mass: 0.8,
        restDelta: 0.001
    });

    const [currentProgress, setCurrentProgress] = useState(0);
    useEffect(() => {
        if (!isDesktop) {
return;
}

        return scrollSpring.on("change", v => {
            setCurrentProgress(v);
        });
    }, [scrollSpring, isDesktop]);

    const getActiveIndex = () => {
        if (currentProgress < 0.16) {
return 0;
}

        if (currentProgress < 0.32) {
return 1;
}

        if (currentProgress < 0.48) {
return 2;
}

        if (currentProgress < 0.64) {
return 3;
}

        if (currentProgress < 0.80) {
return 4;
}

        return 5;
    };
    const activeIdx = getActiveIndex();

    // Section transforms with smooth overlapping fade-in/out ranges
    const opacity1 = useTransform(scrollSpring, [0.12, 0.20], [1, 0]);
    const opacity2 = useTransform(scrollSpring, [0.12, 0.20, 0.28, 0.36], [0, 1, 1, 0]);
    const opacity3 = useTransform(scrollSpring, [0.28, 0.36, 0.44, 0.52], [0, 1, 1, 0]);
    const opacity4 = useTransform(scrollSpring, [0.44, 0.52, 0.60, 0.68], [0, 1, 1, 0]);
    const opacity5 = useTransform(scrollSpring, [0.60, 0.68, 0.76, 0.84], [0, 1, 1, 0]);
    const opacity6 = useTransform(scrollSpring, [0.76, 0.84], [0, 1]);

    // Distinct translation offsets for exit/entry motions (80px)
    const yOffset1 = useTransform(scrollSpring, [0.12, 0.20], [0, -80]);
    const yOffset2 = useTransform(scrollSpring, [0.12, 0.20, 0.28, 0.36], [80, 0, 0, -80]);
    const yOffset3 = useTransform(scrollSpring, [0.28, 0.36, 0.44, 0.52], [80, 0, 0, -80]);
    const yOffset4 = useTransform(scrollSpring, [0.44, 0.52, 0.60, 0.68], [80, 0, 0, -80]);
    const yOffset5 = useTransform(scrollSpring, [0.60, 0.68, 0.76, 0.84], [80, 0, 0, -80]);
    const yOffset6 = useTransform(scrollSpring, [0.76, 0.84], [80, 0]);

    // Luxurious blur focus-pull transforms (0px to 8px)
    const filter1 = useTransform(scrollSpring, [0.12, 0.20], ["blur(0px)", "blur(8px)"]);
    const filter2 = useTransform(scrollSpring, [0.12, 0.20, 0.28, 0.36], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
    const filter3 = useTransform(scrollSpring, [0.28, 0.36, 0.44, 0.52], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
    const filter4 = useTransform(scrollSpring, [0.44, 0.52, 0.60, 0.68], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
    const filter5 = useTransform(scrollSpring, [0.60, 0.68, 0.76, 0.84], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
    const filter6 = useTransform(scrollSpring, [0.76, 0.84], ["blur(8px)", "blur(0px)"]);

    const opacities = [opacity1, opacity2, opacity3, opacity4, opacity5, opacity6];

    // Background panning camera animations (smoothed with spring track)
    const bgScaleDesktop = useTransform(scrollSpring, [0, 1], [1.05, 1.25]);
    const bgXDesktop = useTransform(scrollSpring, [0, 1], ["0%", "-3%"]);
    const bgYDesktop = useTransform(scrollSpring, [0, 1], ["0%", "-2%"]);

    const bgImages = [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80', // lobby room
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80', // modern propositions
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80', // cozy bed 3d rooms
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80', // landscape exterior map
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80', // seating cafe reviews
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'  // library office faq
    ];

    const sections = [
        { name: 'Welcome', label: 'Welcome' },
        { name: 'Propositions', label: 'Keunggulan' },
        { name: 'Rooms', label: 'Kamar Pilihan' },
        { name: 'Location', label: 'Lokasi & Akses' },
        { name: 'Testimonials', label: 'Ulasan Tamu' },
        { name: 'FAQ', label: 'FAQ' }
    ];

    const scrollToSection = (index: number) => {
        const container = containerRef.current;

        if (!container) {
return;
}

        const rect = container.getBoundingClientRect();
        const totalScroll = container.scrollHeight - window.innerHeight;
        const targets = [0, 0.24, 0.40, 0.56, 0.72, 0.92];
        const targetScrollY = window.scrollY + rect.top + targets[index] * totalScroll;
        window.scrollTo({
            top: targetScrollY,
            behavior: 'smooth'
        });
    };

    // 3D Room Slider state
    const [sliderIndex, setSliderIndex] = useState(0);

    const handlePrevSlide = () => {
        setSliderIndex(prev => (prev === 0 ? featuredHomestays.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setSliderIndex(prev => (prev === featuredHomestays.length - 1 ? 0 : prev + 1));
    };

    // Render the Scrollytelling layout for Desktop users
    if (mounted && isDesktop) {
        return (
            <LuxuryLayout>
                <Head title="Booking Kamar Premium & Eksklusif" />

                <div ref={containerRef} className="relative h-[650vh] bg-black w-full -mt-24 overflow-visible">
                    <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
                        {/* A. Camera-Pan background image fading */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {bgImages.map((src, idx) => (
                                <motion.div
                                    key={idx}
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url("${src}")`,
                                        opacity: opacities[idx],
                                        scale: bgScaleDesktop,
                                        x: bgXDesktop,
                                        y: bgYDesktop,
                                        filter: isDark ? 'brightness(0.18) contrast(1.1)' : 'brightness(0.95) contrast(0.9) saturate(0.95)',
                                    }}
                                />
                            ))}
                            <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
                                isDark 
                                    ? 'bg-gradient-to-b from-black via-black/40 to-[#080808]' 
                                    : 'bg-gradient-to-b from-white/95 via-white/80 to-[#f5f5f4]'
                            }`} />
                        </div>

                        {/* B. Interactive Vertical Side Navigation */}
                        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6 hidden lg:flex">
                            <div className={`absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                            
                            {sections.map((sect, idx) => {
                                const isActive = idx === activeIdx;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToSection(idx)}
                                        className="group relative flex items-center justify-center h-8 w-8 focus:outline-none cursor-pointer"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: isActive ? 1.25 : 1.0,
                                                backgroundColor: isActive ? '#d4af37' : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'),
                                            }}
                                            className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                                isActive 
                                                    ? 'ring-4 ring-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.6)]' 
                                                    : 'group-hover:scale-125 group-hover:bg-gold/60'
                                            }`}
                                        />
                                        <span className={`absolute left-10 py-1 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase font-outfit transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl border ${
                                            isDark 
                                                ? 'bg-[#111111] text-white border-white/10' 
                                                : 'bg-white text-neutral-900 border-black/10'
                                        }`}>
                                            {sect.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* C. Section Containers */}
                        <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-6 md:p-12 overflow-visible">
                            
                            {/* SECTION 1: HERO / WELCOME */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: opacity1,
                                    y: yOffset1,
                                    filter: filter1,
                                    pointerEvents: activeIdx === 0 ? 'auto' : 'none',
                                    display: currentProgress < 0.20 ? 'flex' : 'none',
                                }}
                                className="w-full h-full flex flex-col justify-center items-center pt-12 text-center"
                            >
                                <div className="max-w-5xl px-6 text-center space-y-5 flex flex-col items-center justify-center w-full">
                                    <span className="block font-outfit text-xs md:text-sm font-bold text-gold tracking-widest uppercase mb-1">
                                        Yuri Homestay — Kehangatan Rumah, Kemewahan Hotel
                                    </span>

                                    <h1 className="font-outfit text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight text-neutral-900 dark:text-white">
                                        Temukan Ketenangan Mewah <br />
                                        di <span className="bg-gradient-to-r from-gold via-neutral-900 to-gold dark:via-white bg-clip-text text-transparent">{siteName}</span> Anda
                                    </h1>

                                    <p className="mx-auto max-w-2xl text-sm md:text-base text-neutral-600 dark:text-white/55 leading-relaxed">
                                        Nikmati kemewahan staycation terkurasi dengan arsitektur premium, pemandangan alam memukau, dan kalender booking instan terjamin aman.
                                    </p>

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
                                            <div className="mx-auto max-w-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm shadow-xs">
                                                <span className="block text-[8px] font-bold text-gold/80 uppercase tracking-widest mb-1">Sambutan Hari Ini</span>
                                                <p className="text-xs text-neutral-700 dark:text-white/70 italic font-medium leading-relaxed font-sans">
                                                    "{dailyQuote}"
                                                </p>
                                            </div>
                                        );
                                    })()}

                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="mx-auto mt-8 flex flex-col md:flex-row items-center gap-4 bg-white/95 dark:bg-deep-charcoal/80 border border-neutral-200 dark:border-white/10 p-4 rounded-3xl shadow-2xl max-w-4xl backdrop-blur-xl md:rounded-full w-full"
                                    >
                                        <div className="relative flex w-full items-center space-x-3 px-4 py-2 border-b border-neutral-100 dark:border-white/5 md:border-b-0 md:border-r border-neutral-200 dark:border-white/10" ref={roomDropdownRef}>
                                            <Hotel className="h-5 w-5 text-gold shrink-0" />
                                            <div className="text-left w-full cursor-pointer select-none" onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}>
                                                <label className="block text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-widest cursor-pointer">Kategori Kamar</label>
                                                <div className="flex items-center justify-between w-full text-sm font-semibold text-neutral-800 dark:text-white mt-0.5">
                                                    <span className="line-clamp-1">{searchParams.city ? `Kamar ${searchParams.city}` : 'Semua Kategori Kamar'}</span>
                                                    <ChevronDown className={`h-4 w-4 text-gold/60 transition-transform duration-300 ${roomDropdownOpen ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {roomDropdownOpen && (
                                                <div className="absolute top-[calc(100%+16px)] left-0 z-50 w-full min-w-[240px] bg-white dark:bg-deep-charcoal border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-2 text-left animate-in fade-in slide-in-from-top-2 duration-200">
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
                                                                    : 'text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
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
                                                                        : 'text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
                                                                }`}
                                                            >
                                                                Kamar {catName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative flex w-full items-center space-x-3 px-4 py-2" ref={guestDropdownRef}>
                                            <Users className="h-5 w-5 text-gold shrink-0" />
                                            <div className="text-left w-full cursor-pointer select-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                                <label className="block text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-widest cursor-pointer">Jumlah Tamu</label>
                                                <div className="flex items-center justify-between w-full text-sm font-semibold text-neutral-800 dark:text-white mt-0.5">
                                                    <span>{searchParams.guests} Tamu</span>
                                                    <ChevronDown className={`h-4 w-4 text-gold/60 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {dropdownOpen && (
                                                <div className="absolute top-[calc(100%+16px)] left-0 z-50 w-full min-w-[200px] bg-white dark:bg-deep-charcoal border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-2 text-left animate-in fade-in slide-in-from-top-2 duration-200">
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
                                                                        : 'text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
                                                                }`}
                                                            >
                                                                {num} Tamu
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full md:w-auto shrink-0 flex items-center justify-center space-x-2 bg-gold hover:bg-neutral-800 hover:text-white dark:hover:bg-white dark:hover:text-deep-black text-deep-black font-bold py-4 px-8 rounded-2xl md:rounded-full transition-all duration-300 transform active:scale-95 shadow-xl hover:scale-105 cursor-pointer"
                                        >
                                            <Search className="h-4 w-4" />
                                            <span>Cari Kamar</span>
                                        </button>
                                    </form>
                                </div>
                            </motion.div>

                            {/* SECTION 2: PROPOSITIONS */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: opacity2,
                                    y: yOffset2,
                                    filter: filter2,
                                    pointerEvents: activeIdx === 1 ? 'auto' : 'none',
                                    display: currentProgress >= 0.12 && currentProgress < 0.36 ? 'flex' : 'none',
                                }}
                                className="w-full h-full flex flex-col justify-center items-center text-center max-w-5xl mx-auto"
                            >
                                <div className="space-y-3 mb-12">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Keunggulan Layanan</span>
                                    <h2 className="font-outfit text-3xl font-extrabold md:text-4xl text-neutral-900 dark:text-white">Mengapa Memilih Yuri Homestay?</h2>
                                    <p className="text-xs max-w-md mx-auto text-neutral-500 dark:text-white/40">Kualitas istirahat, rasa aman, dan kepraktisan layanan kami dedikasikan sepenuhnya untuk Anda.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                    <motion.div 
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        className={`flex flex-col items-center space-y-3 p-6 border rounded-3xl transition-all ${
                                            isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white/80 border-black/5 shadow-md backdrop-blur-xs'
                                        }`}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                            <Compass className="h-6 w-6" />
                                        </div>
                                        <h3 className={`font-outfit text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>Pilihan Kamar Terkurasi</h3>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Pilihan tipe kamar mewah dengan standar kebersihan, estetika visual, dan fasilitas modern terlengkap.</p>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        className={`flex flex-col items-center space-y-3 p-6 border rounded-3xl transition-all ${
                                            isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white/80 border-black/5 shadow-md backdrop-blur-xs'
                                        }`}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <h3 className={`font-outfit text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>Booking Aman & Terjamin</h3>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Pencegahan pemesanan tanggal ganda melalui integrasi locking database transaksi real-time.</p>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        className={`flex flex-col items-center space-y-3 p-6 border rounded-3xl transition-all ${
                                            isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white/80 border-black/5 shadow-md backdrop-blur-xs'
                                        }`}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <h3 className={`font-outfit text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>Auto-Register On Checkout</h3>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Tidak perlu ribet daftar di awal. Akun otomatis aktif instan saat melakukan reservasi stay.</p>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* SECTION 3: ROOMS SLIDER */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: opacity3,
                                    y: yOffset3,
                                    filter: filter3,
                                    pointerEvents: activeIdx === 2 ? 'auto' : 'none',
                                    display: currentProgress >= 0.28 && currentProgress < 0.52 ? 'flex' : 'none',
                                }}
                                className="w-full h-full flex flex-col justify-center items-center text-center max-w-6xl mx-auto overflow-visible"
                            >
                                <div className="w-full flex flex-col md:flex-row items-end justify-between mb-8">
                                    <div className="space-y-2 text-left">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Rekomendasi Terbaik</span>
                                        <h2 className="font-outfit text-3xl font-extrabold md:text-4xl text-neutral-900 dark:text-white">Homestay Terpopuler Saat Ini</h2>
                                    </div>
                                    <Link
                                        href="/explore"
                                        className="group inline-flex items-center text-xs font-bold text-gold hover:text-gold/80 transition-colors mt-4 md:mt-0"
                                    >
                                        <span>Lihat Semua Homestay</span>
                                        <ArrowRight className="ml-1.5 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>

                                <div className="relative w-full h-[470px] flex items-center justify-center overflow-visible select-none" style={{ perspective: '1200px' }}>
                                    {featuredHomestays.map((homestay, idx) => {
                                        const diff = idx - sliderIndex;
                                        const isActive = idx === sliderIndex;
                                        const absDiff = Math.abs(diff);
                                        
                                        if (absDiff > 2) {
return null;
}

                                        return (
                                            <motion.div
                                                key={homestay.id}
                                                style={{
                                                    position: 'absolute',
                                                    zIndex: 10 - absDiff,
                                                    transformStyle: 'preserve-3d',
                                                }}
                                                animate={{
                                                    x: diff * 320,
                                                    scale: isActive ? 1.05 : 0.85,
                                                    rotateY: diff === 0 ? 0 : (diff > 0 ? -22 : 22),
                                                    opacity: isActive ? 1 : 0.45,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 140,
                                                    damping: 18
                                                }}
                                                className="w-full max-w-[320px] md:max-w-[340px] shrink-0"
                                            >
                                                <HomestayCard 
                                                    homestay={homestay} 
                                                    idx={idx} 
                                                    isDark={isDark} 
                                                    isActive={isActive} 
                                                    onFocus={() => setSliderIndex(idx)} 
                                                />
                                            </motion.div>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={handlePrevSlide}
                                        className={`absolute left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border transition-all cursor-pointer ${
                                            isDark 
                                                ? 'bg-black/60 border-white/10 text-white hover:bg-gold hover:text-deep-black hover:border-gold' 
                                                : 'bg-white/80 border-black/10 text-neutral-800 hover:bg-gold hover:text-deep-black hover:border-gold shadow-md'
                                        }`}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>

                                    <button
                                        onClick={handleNextSlide}
                                        className={`absolute right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border transition-all cursor-pointer ${
                                            isDark 
                                                ? 'bg-black/60 border-white/10 text-white hover:bg-gold hover:text-deep-black hover:border-gold' 
                                                : 'bg-white/80 border-black/10 text-neutral-800 hover:bg-gold hover:text-deep-black hover:border-gold shadow-md'
                                        }`}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="flex justify-center items-center gap-2 mt-6">
                                    {featuredHomestays.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSliderIndex(idx)}
                                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                                idx === sliderIndex ? 'w-8 bg-gold' : `w-2 ${isDark ? 'bg-white/20' : 'bg-black/20'}`
                                            }`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* SECTION 4: LOCATION */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: opacity4,
                                    y: yOffset4,
                                    filter: filter4,
                                    pointerEvents: activeIdx === 3 ? 'auto' : 'none',
                                    display: currentProgress >= 0.44 && currentProgress < 0.68 ? 'flex' : 'none',
                                }}
                                className="w-full h-full flex flex-col justify-center items-center max-w-6xl mx-auto"
                            >
                                <div className="flex flex-col lg:flex-row gap-12 items-center w-full">
                                    <div className="w-full lg:w-1/2 space-y-6 text-left">
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Akses Kamar</span>
                                            <h2 className="font-outfit text-3xl font-extrabold md:text-4xl text-neutral-900 dark:text-white">Lokasi & Akses Yuri-HomeStay</h2>
                                            <p className="text-xs leading-relaxed text-neutral-500 dark:text-white/50">
                                                Terletak di lokasi yang sangat strategis di pusat kota Lhokseumawe, Yuri-HomeStay memberikan kemudahan akses maksimal menuju berbagai pusat bisnis, kuliner legendaris, and lokasi wisata alam terpopuler di Aceh Utara.
                                            </p>
                                        </div>

                                        <div 
                                            className={`p-5 border rounded-3xl space-y-3 transition-all ${
                                                isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-neutral-800'}`}>Alamat Fisik Penginapan</h4>
                                                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                                        54JC+JV2, Mns Mesjid, Kec. Muara Dua, Kota Lhokseumawe, Aceh 24355
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-outfit text-xs font-bold uppercase text-gold tracking-wider">Estimasi Waktu Akses Terdekat</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { time: '2M', label: 'Pusat Kota', desc: 'Pusat Kota Lhokseumawe' },
                                                    { time: '5M', label: 'Wisata Air', desc: 'Waduk Pusong' },
                                                    { time: '8M', label: 'Wisata Pantai', desc: 'Pantai Ujong Blang' },
                                                    { time: '1M', label: 'Kuliner Lokal', desc: 'Sentra Kopi Gayo' }
                                                ].map((landmark, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={`flex items-center space-x-3 p-3 border rounded-2xl transition-all ${
                                                            isDark ? 'bg-black/40 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                                        }`}
                                                    >
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold font-outfit text-xs font-bold">{landmark.time}</span>
                                                        <div className="text-left">
                                                            <span className={`block text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>{landmark.label}</span>
                                                            <span className={`text-xs font-bold truncate block max-w-[120px] ${isDark ? 'text-white' : 'text-neutral-800'}`}>{landmark.desc}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`w-full lg:w-1/2 aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border shadow-2xl relative transition-all ${
                                            isDark ? 'border-white/10 bg-[#111111]' : 'border-neutral-200 bg-neutral-100'
                                        }`}
                                    >
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
                            </motion.div>

                            {/* SECTION 5: TESTIMONIALS */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: opacity5,
                                    y: yOffset5,
                                    filter: filter5,
                                    pointerEvents: activeIdx === 4 ? 'auto' : 'none',
                                    display: currentProgress >= 0.60 && currentProgress < 0.84 ? 'flex' : 'none',
                                }}
                                className="w-full h-full flex flex-col justify-center items-center max-w-6xl mx-auto"
                            >
                                <div className="space-y-2 mb-10 text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Testimoni Pengunjung</span>
                                    <h2 className="font-outfit text-3xl font-extrabold md:text-4xl text-neutral-900 dark:text-white">Apa Kata Mereka Tentang Kami?</h2>
                                    <p className="text-xs max-w-md mx-auto text-neutral-500 dark:text-white/40">Ulasan jujur dari tamu-tamu yang telah merasakan kehangatan menginap di Yuri Homestay.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                    {reviews.slice(0, 3).map((r) => (
                                        <div 
                                            key={r.id} 
                                            className={`p-6 border rounded-3xl space-y-4 shadow-xl backdrop-blur-xs text-left transition-all ${
                                                isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1 text-gold">
                                                    {Array.from({ length: r.rating }).map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 fill-gold shrink-0 text-gold" />
                                                    ))}
                                                </div>
                                                <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                                                    {formatDate(r.created_at)}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed font-sans italic line-clamp-4 ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                                "{r.comment}"
                                            </p>
                                            <div className={`border-t pt-3 flex items-center space-x-3 ${isDark ? 'border-white/5' : 'border-neutral-200'}`}>
                                                <div className="h-8 w-8 overflow-hidden rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                                    {r.guest.avatar ? (
                                                        <img src={r.guest.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Users className="h-4 w-4 text-gold" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className={`block text-xs font-bold truncate max-w-[120px] ${isDark ? 'text-white' : 'text-neutral-800'}`}>{r.guest.name}</span>
                                                    <span className="text-[9px] text-gold font-medium line-clamp-1">Menginap di {r.homestay.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && (
                                        <div className="col-span-3 text-center py-12 text-sm text-neutral-500 dark:text-white/40">
                                            Belum ada ulasan untuk saat ini.
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* SECTION 6: FAQ */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: opacity6,
                                    y: yOffset6,
                                    filter: filter6,
                                    pointerEvents: activeIdx === 5 ? 'auto' : 'none',
                                    display: currentProgress >= 0.76 ? 'flex' : 'none',
                                }}
                                className="w-full h-full flex flex-col justify-center items-center max-w-3xl mx-auto"
                            >
                                <div className="space-y-2 mb-10 text-center">
                                    <HelpCircle className="mx-auto h-8 w-8 text-gold animate-bounce" />
                                    <h2 className="font-outfit text-3xl font-extrabold text-neutral-900 dark:text-white">Pertanyaan Umum (FAQ)</h2>
                                    <p className="text-xs text-neutral-500 dark:text-white/40">Jawaban cepat atas pertanyaan seputar pemesanan homestay</p>
                                </div>

                                <div className="space-y-4 w-full">
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
                                        <div 
                                            key={idx} 
                                            className={`p-5 border rounded-2xl transition-all ${
                                                isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                            }`}
                                        >
                                            <h4 className={`font-outfit font-bold text-sm mb-1.5 ${isDark ? 'text-white' : 'text-neutral-800'}`}>{faq.q}</h4>
                                            <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </LuxuryLayout>
        );
    }

    // Default / Mobile / SSR Layout
    return (
        <LuxuryLayout>
            <Head title="Booking Kamar Premium & Eksklusif" />

            {/* 1. HERO SECTION WITH 3D SCROLL DRIVEN PERSPECTIVE */}
            <div ref={coverRef} className="relative h-[115vh] bg-black w-full overflow-hidden -mt-24" style={{ perspective: '1200px' }}>
                <div 
                    className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
                    onMouseMove={handleHeroMouseMove}
                    onMouseLeave={handleHeroMouseLeave}
                >
                    <motion.div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                            backgroundImage: 'url("https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80")',
                            filter: 'brightness(0.18) contrast(1.1)',
                            scale: bgScale,
                            opacity,
                        }}
                    />
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-[#080808] pointer-events-none"
                        style={{ opacity }}
                    />

                    {/* Background glowing highlights with Framer Motion Parallax */}
                    <motion.div 
                        style={{ y: yHeroBg1, opacity }}
                        className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[150px] pointer-events-none"
                    />
                    <motion.div 
                        style={{ y: yHeroBg2, opacity }}
                        className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-gold/5 blur-[120px] pointer-events-none"
                    />

                    <motion.div
                        style={{
                            scale,
                            rotateX,
                            opacity,
                            y: yTranslate,
                            transformStyle: 'preserve-3d',
                            visibility,
                            pointerEvents,
                        }}
                        className="relative w-full h-full flex flex-col justify-center items-center p-6 md:p-12 text-white origin-center"
                    >
                        {/* Interactive Mouse Tilt Wrapper */}
                        <motion.div
                            style={{
                                rotateX: heroTiltX,
                                rotateY: heroTiltY,
                                transformStyle: 'preserve-3d',
                            }}
                            className="relative z-10 mx-auto max-w-5xl px-6 text-center space-y-6 md:px-8 flex flex-col items-center justify-center w-full"
                        >
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
                                        <div className="absolute top-[calc(100%+16px)] left-0 z-50 w-full min-w-[240px] bg-deep-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-2 text-left animate-in fade-in slide-in-from-top-2 duration-200">
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
                                        <div className="absolute top-[calc(100%+16px)] left-0 z-50 w-full min-w-[200px] bg-deep-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-2 text-left animate-in fade-in slide-in-from-top-2 duration-200">
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
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Anchor tag for scroll */}
            <div id="search-explore-section" />

            {/* 3. VALUE PROPOSITIONS SECTION */}
            <Scroll3DSection>
                <section className={`py-16 transition-colors duration-300 ${isDark ? 'bg-[#080808]' : 'bg-[#f0f0ef]'}`}>
                    <div className="mx-auto max-w-7xl px-6 md:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" style={{ transformStyle: 'preserve-3d' }}>
                            <motion.div 
                                whileHover={{ translateZ: 25, scale: 1.03 }}
                                className={`flex flex-col items-center space-y-3 p-6 border rounded-2xl transition-all ${
                                    isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                }`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <h3 className={`font-outfit text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>Pilihan Kamar Terkurasi</h3>
                                <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Pilihan tipe kamar mewah dengan standar kebersihan, estetika visual, dan fasilitas modern terlengkap.</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ translateZ: 25, scale: 1.03 }}
                                className={`flex flex-col items-center space-y-3 p-6 border rounded-2xl transition-all ${
                                    isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                }`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className={`font-outfit text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>Booking Aman & Terjamin</h3>
                                <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Pencegahan pemesanan tanggal ganda melalui integrasi locking database transaksi real-time.</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ translateZ: 25, scale: 1.03 }}
                                className={`flex flex-col items-center space-y-3 p-6 border rounded-2xl transition-all ${
                                    isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                }`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className={`font-outfit text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>Auto-Register On Checkout</h3>
                                <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Tidak perlu ribet daftar di awal. Akun otomatis aktif instan saat melakukan reservasi stay.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </Scroll3DSection>

            {/* 4. FEATURED POPULAR PROPERTIES */}
            <Scroll3DSection>
                <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-[#050505]' : 'bg-[#fafafa]'}`}>
                    <div className="mx-auto max-w-7xl px-6 md:px-8">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Rekomendasi Terbaik</span>
                                <h2 className={`font-outfit text-3xl font-extrabold md:text-4xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>Homestay Terpopuler Saat Ini</h2>
                            </div>
                            <Link
                                href="/explore"
                                className="group inline-flex items-center text-xs font-bold text-gold hover:text-gold/80 transition-colors mt-4 md:mt-0"
                            >
                                <span>Lihat Semua Homestay</span>
                                <ArrowRight className="ml-1.5 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ transformStyle: 'preserve-3d' }}>
                            {featuredHomestays.map((homestay, idx) => (
                                <HomestayCard key={homestay.id} homestay={homestay} idx={idx} isDark={isDark} />
                            ))}
                        </div>
                    </div>
                </section>
            </Scroll3DSection>

            {/* 5. PREMIUM LOCATION & INTERACTIVE MAP */}
            <Scroll3DSection>
                <section className={`py-24 mx-auto max-w-7xl px-6 md:px-8 border-t transition-colors duration-300 ${
                    isDark ? 'border-white/5 bg-[#050505]' : 'border-black/5 bg-[#fafafa]'
                }`}>
                    <div className="flex flex-col lg:flex-row gap-12 items-center" style={{ transformStyle: 'preserve-3d' }}>
                        <div className="w-full lg:w-1/2 space-y-6 text-left">
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Akses Kamar</span>
                                <h2 className={`font-outfit text-3xl font-extrabold md:text-4xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>Lokasi & Akses Yuri-HomeStay</h2>
                                <p className={`text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                                    Terletak di lokasi yang sangat strategis di pusat kota Lhokseumawe, Yuri-HomeStay memberikan kemudahan akses maksimal menuju berbagai pusat bisnis, kuliner legendaris, and lokasi wisata alam terpopuler di Aceh Utara.
                                </p>
                            </div>

                            <motion.div 
                                whileHover={{ translateZ: 15, scale: 1.01 }}
                                className={`p-6 border rounded-3xl space-y-3 transition-all ${
                                    isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-neutral-800'}`}>Alamat Fisik Penginapan</h4>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                            54JC+JV2, Mns Mesjid, Kec. Muara Dua, Kota Lhokseumawe, Aceh 24355
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="space-y-4" style={{ transformStyle: 'preserve-3d' }}>
                                <h4 className="font-outfit text-xs font-bold uppercase text-gold tracking-wider">Estimasi Waktu Akses Terdekat</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { time: '2M', label: 'Pusat Kota', desc: 'Pusat Kota Lhokseumawe' },
                                        { time: '5M', label: 'Wisata Air', desc: 'Waduk Pusong Lhokseumawe' },
                                        { time: '8M', label: 'Wisata Pantai', desc: 'Pantai Ujong Blang' },
                                        { time: '1M', label: 'Kuliner Lokal', desc: 'Sentra Kopi Gayo Lhokseumawe' }
                                    ].map((landmark, idx) => (
                                        <motion.div 
                                            key={idx}
                                            whileHover={{ translateZ: 20, scale: 1.02 }}
                                            className={`flex items-center space-x-3 p-4 border rounded-2xl transition-all ${
                                                isDark ? 'bg-black/40 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                            }`}
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold font-outfit text-xs font-bold">{landmark.time}</span>
                                            <div className="text-left">
                                                <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>{landmark.label}</span>
                                                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>{landmark.desc}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div 
                            whileHover={{ translateZ: 30, scale: 1.01 }}
                            className={`w-full lg:w-1/2 aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border shadow-2xl relative transition-all ${
                                isDark ? 'border-white/10 bg-[#111111]' : 'border-neutral-200 bg-neutral-100'
                            }`}
                        >
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
                        </motion.div>
                    </div>
                </section>
            </Scroll3DSection>

            {/* 5.5 TESTIMONIALS */}
            <Scroll3DSection>
                <section className={`py-24 mx-auto max-w-7xl px-6 md:px-8 border-t text-left transition-colors duration-300 ${
                    isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-neutral-100/60'
                }`}>
                    <div className="space-y-2 mb-12 text-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-gold font-outfit">Testimoni Pengunjung</span>
                        <h2 className={`font-outfit text-3xl font-extrabold md:text-4xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>Apa Kata Mereka Tentang Kami?</h2>
                        <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Ulasan jujur dari tamu-tamu yang telah merasakan kehangatan menginap di Yuri Homestay.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ transformStyle: 'preserve-3d' }}>
                        {reviews.map((r) => (
                            <motion.div 
                                key={r.id} 
                                whileHover={{ translateZ: 25, scale: 1.03 }}
                                className={`p-6 border rounded-3xl space-y-4 shadow-xl backdrop-blur-xs text-left transition-all ${
                                    isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 text-gold">
                                        {Array.from({ length: r.rating }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-gold shrink-0 text-gold" />
                                        ))}
                                    </div>
                                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                                        {formatDate(r.created_at)}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed font-sans italic ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                    "{r.comment}"
                                </p>
                                <div className={`border-t pt-3 flex items-center space-x-3 ${isDark ? 'border-white/5' : 'border-neutral-200'}`}>
                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                        {r.guest.avatar ? (
                                            <img src={r.guest.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <Users className="h-4 w-4 text-gold" />
                                        )}
                                    </div>
                                    <div>
                                        <span className={`block text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-800'}`}>{r.guest.name}</span>
                                        <span className="text-[9px] text-gold font-medium line-clamp-1">Menginap di {r.homestay.name}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </Scroll3DSection>

            {/* 6. FAQ */}
            <Scroll3DSection>
                <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-[#080808]' : 'bg-[#f0f0ef]'}`}>
                    <div className="mx-auto max-w-3xl px-6 md:px-8 text-center space-y-12">
                        <div className="space-y-2">
                            <HelpCircle className="mx-auto h-8 w-8 text-gold animate-bounce" />
                            <h2 className={`font-outfit text-3xl font-extrabold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Pertanyaan Umum (FAQ)</h2>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Jawaban cepat atas pertanyaan seputar pemesanan homestay</p>
                        </div>

                        <div className="space-y-4 text-left" style={{ transformStyle: 'preserve-3d' }}>
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
                                <motion.div 
                                    key={idx} 
                                    whileHover={{ translateZ: 20, scale: 1.02 }}
                                    className={`p-6 border rounded-2xl transition-all ${
                                        isDark ? 'bg-deep-charcoal/30 border-white/5' : 'bg-white border-black/5 shadow-xs'
                                    }`}
                                >
                                    <h4 className={`font-outfit font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-neutral-800'}`}>{faq.q}</h4>
                                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>{faq.a}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </Scroll3DSection>
        </LuxuryLayout>
    );
}
