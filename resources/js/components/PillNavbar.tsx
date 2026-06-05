import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Home, Compass, Info, ArrowUpRight, User, LogOut } from 'lucide-react';

export default function PillNavbar() {
    const { auth, name } = usePage().props as any;
    const siteName = name || 'Yuri-HomeStay';
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const formatBrandName = (str: string) => {
        const upper = str.toUpperCase();
        if (upper.includes('-')) {
            const idx = upper.indexOf('-');
            return (
                <>
                    {upper.substring(0, idx)}<span className="text-gold">{upper.substring(idx)}</span>
                </>
            );
        }
        if (upper.endsWith('HOMESTAY')) {
            return (
                <>
                    {upper.substring(0, upper.length - 8)}<span className="text-gold">HOMESTAY</span>
                </>
            );
        }
        return (
            <>
                {upper}<span className="text-gold">.</span>
            </>
        );
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // Smart hide / show navbar
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setVisible(false); // scrolling down, hide
            } else {
                setVisible(true); // scrolling up, show
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header
            className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 transform ${
                visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
            }`}
        >
            <nav
                className={`glass-pill flex h-14 w-full max-w-4xl items-center justify-between px-6 rounded-full shadow-2xl transition-all duration-500 ${
                    scrolled 
                        ? 'border-gold/30 bg-[#0d0d0c]/90 py-2 scale-[0.98]' 
                        : 'border-white/10 bg-[#0d0d0c]/85 py-3'
                }`}
            >
                {/* Brand Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-outfit text-base md:text-lg font-extrabold tracking-widest text-white whitespace-nowrap">
                        {formatBrandName(siteName)}
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden items-center space-x-8 md:flex">
                    <Link
                        href="/"
                        className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-gold"
                    >
                        <Home className="mr-1.5 h-4 w-4" />
                        Beranda
                    </Link>
                    <Link
                        href="/explore"
                        className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-gold"
                    >
                        <Compass className="mr-1.5 h-4 w-4" />
                        Cari Kamar
                    </Link>
                    <Link
                        href="/help"
                        className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-gold"
                    >
                        <Info className="mr-1.5 h-4 w-4" />
                        Pusat Bantuan
                    </Link>
                </div>

                {/* Authentication Controls */}
                <div className="flex items-center space-x-3">
                    {auth?.user ? (
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/dashboard"
                                className="group flex items-center bg-gold text-deep-black font-semibold text-xs py-2.5 px-4 rounded-full transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
                            >
                                <User className="mr-1.5 h-3.5 w-3.5" />
                                Panel {auth.user.role === 'admin' ? 'Admin' : auth.user.role === 'host' ? 'Host' : 'Guest'}
                            </Link>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="hidden items-center text-xs font-semibold text-white/60 transition-colors hover:text-red-400 sm:flex"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="group flex items-center bg-gold text-deep-black font-bold text-xs py-2 px-4 rounded-full transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
                            >
                                Log in
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
