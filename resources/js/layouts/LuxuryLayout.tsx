import { usePage } from '@inertiajs/react';
import { ArrowUp, Instagram, Github, PhoneCall, Mail, MapPin } from 'lucide-react';
import type { ReactNode} from 'react';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import CustomCursor from '@/components/CustomCursor';
import PillNavbar from '@/components/PillNavbar';
import Preloader from '@/components/Preloader';
import { useAppearance } from '@/hooks/use-appearance';

interface LuxuryLayoutProps {
    children: ReactNode;
}

export default function LuxuryLayout({ children }: LuxuryLayoutProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { name, phone, email, address, instagram, github } = usePage().props as any;
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        // Anti-theft Copy Watermark Listener
        const handleCopy = (e: ClipboardEvent) => {
            const selection = document.getSelection();

            if (selection && selection.toString().length > 30) {
                const watermarkText = `\n\n[Salinan Resmi HomeStay-Apps. Baca selengkapnya di: ${window.location.href}]`;
                e.clipboardData?.setData('text/plain', selection.toString() + watermarkText);
                e.preventDefault();
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('copy', handleCopy);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('copy', handleCopy);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDark 
                ? 'bg-[#050505] text-[#ededec] selection:bg-[#c5a880] selection:text-black' 
                : 'bg-[#fafafa] text-[#1a1a1a] selection:bg-[#c5a880] selection:text-white'
        } overflow-x-clip`}>
            {/* Custom Preloader */}
            <Preloader />

            {/* Custom Interactive Follower Cursor */}
            <CustomCursor />

            {/* Floating pill Navbar */}
            <PillNavbar />

            {/* Main Web Page Content */}
            <main className="pt-24 min-h-[80vh] flex flex-col">
                {children}
            </main>

            {/* High-Fidelity Luxurious Footer */}
            <footer className={`relative mt-auto border-t transition-colors duration-300 ${
                isDark ? 'border-white/5 bg-[#0a0a0a]' : 'border-black/5 bg-[#f5f5f4]'
            } pt-16 pb-8`}>
                {/* Background soft glowing blur radial circle */}
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>
                
                <div className="mx-auto max-w-7xl px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Column 1: Brand Info */}
                        <div className="space-y-4">
                            <span className={`font-outfit text-2xl font-extrabold tracking-widest ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                {(() => {
                                    const siteName = (name || 'Yuri-HomeStay').toUpperCase();

                                    if (siteName.includes('-')) {
                                        const idx = siteName.indexOf('-');

                                        return (
                                            <>
                                                {siteName.substring(0, idx)}<span className="text-gold">{siteName.substring(idx)}</span>
                                            </>
                                        );
                                    }

                                    if (siteName.endsWith('HOMESTAY')) {
                                        return (
                                            <>
                                                {siteName.substring(0, siteName.length - 8)}<span className="text-gold">HOMESTAY</span>
                                            </>
                                        );
                                    }

                                    return (
                                        <>
                                            {siteName}<span className="text-gold">.</span>
                                        </>
                                    );
                                })()}
                            </span>
                            <p className={`text-xs leading-relaxed max-w-xs ${isDark ? 'text-white/50' : 'text-neutral-600'}`}>
                                Layanan booking kamar mewah premium di Yuri-HomeStay Lhokseumawe. Memberikan pengalaman menginap eksklusif, aman, nyaman, dan tak terlupakan.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="space-y-4">
                            <h4 className="font-outfit text-sm font-semibold tracking-wider uppercase text-gold">Tautan</h4>
                            <ul className={`space-y-2 text-xs ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                <li><a href="/" className="hover:text-gold transition-colors">Beranda</a></li>
                                <li><a href="/explore" className="hover:text-gold transition-colors">Cari Kamar</a></li>
                                <li><a href="/help" className="hover:text-gold transition-colors">Pusat Bantuan</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Kamar Pilihan */}
                        <div className="space-y-4">
                            <h4 className="font-outfit text-sm font-semibold tracking-wider uppercase text-gold">Kamar Pilihan</h4>
                            <ul className={`space-y-2 text-xs ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                <li><a href="/explore" className="hover:text-gold transition-colors">Deluxe Premium Room</a></li>
                                <li><a href="/explore" className="hover:text-gold transition-colors">Executive Glass Suite</a></li>
                                <li><a href="/explore" className="hover:text-gold transition-colors">Heritage Suite Joglo</a></li>
                                <li><a href="/explore" className="hover:text-gold transition-colors">Family Suite Cabin</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Contact Support */}
                        <div className="space-y-4">
                            <h4 className="font-outfit text-sm font-semibold tracking-wider uppercase text-gold">Kontak Kami</h4>
                            <ul className={`space-y-3 text-xs ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                                <li className="flex items-start space-x-2">
                                    <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                                    <span>{address || '54JC+JV2, Mns Mesjid, Kec. Muara Dua, Lhokseumawe, Aceh'}</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <PhoneCall className="h-4 w-4 text-gold shrink-0" />
                                    <span>{phone || '0852-6001-4053'}</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gold shrink-0" />
                                    <span>{email || 'yurihomestay@gmail.com'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 ${
                        isDark ? 'border-white/5 text-white/40' : 'border-black/5 text-neutral-500'
                    } text-[11px]`}>
                        <p>© {new Date().getFullYear()} {name || 'Yuri-HomeStay'} (UAS PABW Lanjut). All Rights Reserved.</p>
                        
                        <div className="flex space-x-4">
                            <a href={instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><Instagram className="h-4 w-4" /></a>
                            <a href={github || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><Github className="h-4 w-4" /></a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top floating button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-deep-black shadow-xl transition-all duration-300 transform border border-gold hover:bg-transparent hover:text-gold ${
                    showScrollTop ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-50 pointer-events-none'
                }`}
            >
                <ArrowUp className="h-5 w-5" />
            </button>

            {/* Global Toaster for notifications */}
            <Toaster position="top-center" richColors />
        </div>
    );
}
