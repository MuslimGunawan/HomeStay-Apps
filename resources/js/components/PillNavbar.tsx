import { Link, usePage } from '@inertiajs/react';
import { Home, Compass, Info, ArrowUpRight, User, LogOut, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

export default function PillNavbar() {
    const { auth, name } = usePage().props as any;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

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
                className={`flex h-14 w-full max-w-4xl items-center justify-between px-6 rounded-full shadow-2xl transition-all duration-500 border backdrop-blur-md ${
                    isDark
                        ? scrolled
                            ? 'border-gold/30 bg-black/85 text-white scale-[0.98]'
                            : 'border-white/10 bg-black/75 text-white'
                        : scrolled
                            ? 'border-gold/40 bg-white/95 text-black scale-[0.98]'
                            : 'border-black/10 bg-white/85 text-black'
                }`}
            >
                {/* Brand Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className={`font-outfit text-base md:text-lg font-extrabold tracking-widest whitespace-nowrap ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {formatBrandName(siteName)}
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden items-center space-x-8 md:flex">
                    <Link
                        href="/"
                        className={`flex items-center text-sm font-medium transition-colors hover:text-gold ${isDark ? 'text-white/70' : 'text-neutral-700'}`}
                    >
                        <Home className="mr-1.5 h-4 w-4" />
                        Beranda
                    </Link>
                    <Link
                        href="/explore"
                        className={`flex items-center text-sm font-medium transition-colors hover:text-gold ${isDark ? 'text-white/70' : 'text-neutral-700'}`}
                    >
                        <Compass className="mr-1.5 h-4 w-4" />
                        Cari Kamar
                    </Link>
                    <Link
                        href="/help"
                        className={`flex items-center text-sm font-medium transition-colors hover:text-gold ${isDark ? 'text-white/70' : 'text-neutral-700'}`}
                    >
                        <Info className="mr-1.5 h-4 w-4" />
                        Pusat Bantuan
                    </Link>
                </div>

                {/* Authentication Controls */}
                <div className="flex items-center space-x-3">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full border transition-all duration-300 cursor-pointer ${
                            isDark 
                                ? 'border-white/10 hover:border-gold hover:text-gold text-white/80 bg-white/5' 
                                : 'border-black/10 hover:border-gold hover:text-gold text-neutral-800 bg-black/5'
                        }`}
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    </button>

                    {auth?.user ? (
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/dashboard"
                                className="group flex items-center bg-gold text-deep-black font-semibold text-xs py-2 px-4 rounded-full transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
                            >
                                <User className="mr-1.5 h-3.5 w-3.5" />
                                Panel {auth.user.role === 'admin' ? 'Admin' : auth.user.role === 'host' ? 'Host' : 'Guest'}
                            </Link>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className={`hidden items-center text-xs font-semibold transition-colors hover:text-red-400 sm:flex ${isDark ? 'text-white/60' : 'text-neutral-600'}`}
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
