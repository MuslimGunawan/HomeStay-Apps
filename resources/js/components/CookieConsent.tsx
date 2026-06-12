import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Sparkles, X, ChevronDown, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showManage, setShowManage] = useState(false);

    // Cookie choice states
    const [choices, setChoices] = useState({
        essential: true, // Always true
        preferences: true,
        analytics: true,
    });

    useEffect(() => {
        // Delay showing the banner slightly for a premium, non-obtrusive feel
        const timer = setTimeout(() => {
            const consent = localStorage.getItem('cookie_consent');

            if (!consent) {
                setVisible(true);
                const storedChoices = localStorage.getItem('cookie_consent_choices');

                if (storedChoices) {
                    try {
                        setChoices(JSON.parse(storedChoices));
                    } catch {
                        // Reset if corrupted
                    }
                }
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const savePreferences = (updatedChoices: typeof choices) => {
        localStorage.setItem('cookie_consent', 'accepted');
        localStorage.setItem('cookie_consent_choices', JSON.stringify(updatedChoices));

        // If preference cookies are disabled, clean up preference cookies and localStorage
        if (!updatedChoices.preferences) {
            localStorage.removeItem('appearance');
            localStorage.removeItem('sidebar_state');
            document.cookie = 'appearance=; path=/; max-age=0; SameSite=Lax';
            document.cookie = 'sidebar_state=; path=/; max-age=0; SameSite=Lax';

            // Dispatch event to notify hooks to reset to system theme
            window.dispatchEvent(new Event('cookie-preferences-disabled'));
        }

        setVisible(false);
    };

    const handleAcceptAll = () => {
        const allTrue = { essential: true, preferences: true, analytics: true };
        setChoices(allTrue);
        savePreferences(allTrue);
    };

    const handleSaveSelection = () => {
        savePreferences(choices);
    };

    const handleDeclineAll = () => {
        const allFalse = { essential: true, preferences: false, analytics: false };
        setChoices(allFalse);
        savePreferences(allFalse);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 z-[9999] md:max-w-md w-full"
                >
                    <div className="relative overflow-hidden bg-neutral-900/95 dark:bg-black/90 border border-gold/20 dark:border-gold/10 p-6 rounded-3xl shadow-2xl backdrop-blur-xl text-left transition-all duration-300">
                        {/* Soft gold radial background glow */}
                        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gold/10 blur-xl pointer-events-none"></div>

                        {/* Top close button */}
                        <button
                            onClick={handleDeclineAll}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors duration-200"
                            aria-label="Tutup"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <h4 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                                    Pengaturan Privasi
                                    <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
                                </h4>
                            </div>

                            <p className="text-[11px] leading-relaxed text-neutral-300 dark:text-neutral-400">
                                Kami menggunakan cookie untuk menghadirkan pengalaman menginap digital yang personal, aman, dan berkelas tinggi. Pilih cookie yang ingin Anda aktifkan di bawah ini.
                            </p>

                            {/* ADVANCED COOKIE MANAGER SECTION */}
                            {showManage ? (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="space-y-3 pt-2 border-t border-neutral-800 dark:border-white/5 overflow-hidden"
                                >
                                    {/* Essential Cookies (Disabled & Checked) */}
                                    <div className="flex items-start justify-between gap-4 p-2.5 rounded-xl bg-white/5 border border-white/5">
                                        <div className="space-y-0.5">
                                            <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Kuki Esensial & Keamanan</span>
                                            <span className="block text-[9px] text-neutral-400">Wajib untuk memproses pemesanan, keamanan CSRF, dan login sesi Anda.</span>
                                        </div>
                                        <div className="h-5 w-5 rounded bg-gold/20 border border-gold/30 flex items-center justify-center text-gold cursor-not-allowed">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                    </div>

                                    {/* Preference Cookies */}
                                    <label className="flex items-start justify-between gap-4 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer select-none">
                                        <div className="space-y-0.5 text-left">
                                            <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Kuki Preferensi & Tema</span>
                                            <span className="block text-[9px] text-neutral-400">Menyimpan preferensi tampilan light/dark mode serta tata letak panel menu Anda.</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={choices.preferences}
                                            onChange={(e) => setChoices({ ...choices, preferences: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="h-5 w-5 rounded bg-neutral-800 border border-neutral-700 peer-checked:bg-gold peer-checked:border-gold flex items-center justify-center text-neutral-900 peer-checked:text-black transition-all">
                                            <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                    </label>

                                    {/* Analytics Cookies */}
                                    <label className="flex items-start justify-between gap-4 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer select-none">
                                        <div className="space-y-0.5 text-left">
                                            <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Kuki Statistik & Analitik</span>
                                            <span className="block text-[9px] text-neutral-400">Membantu kami memahami interaksi pengunjung demi peningkatan kualitas layanan di masa depan.</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={choices.analytics}
                                            onChange={(e) => setChoices({ ...choices, analytics: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="h-5 w-5 rounded bg-neutral-800 border border-neutral-700 peer-checked:bg-gold peer-checked:border-gold flex items-center justify-center text-neutral-900 peer-checked:text-black transition-all">
                                            <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                    </label>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={() => setShowManage(true)}
                                    className="w-full py-2 border border-dashed border-neutral-800 hover:border-gold/45 rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 hover:text-gold uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer"
                                >
                                    <span>Kelola Pilihan Cookie</span>
                                    <ChevronDown className="h-3 w-3" />
                                </button>
                            )}

                            {/* CTAs */}
                            <div className="flex items-center gap-3 pt-2">
                                {showManage ? (
                                    <>
                                        <button
                                            onClick={handleDeclineAll}
                                            className="flex-1 border border-neutral-700 dark:border-white/10 hover:border-gold dark:hover:border-gold hover:bg-gold/5 text-neutral-300 dark:text-white font-semibold text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                                        >
                                            Tolak Semua
                                        </button>
                                        <button
                                            onClick={handleSaveSelection}
                                            className="flex-1 bg-gold hover:bg-white text-deep-black font-extrabold text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all duration-300 shadow-lg shadow-gold/15 hover:shadow-white/10 active:scale-95 cursor-pointer"
                                        >
                                            Simpan Pilihan
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleDeclineAll}
                                            className="flex-1 border border-neutral-700 dark:border-white/10 hover:border-gold dark:hover:border-gold hover:bg-gold/5 text-neutral-300 dark:text-white font-semibold text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                                        >
                                            Tolak
                                        </button>
                                        <button
                                            onClick={handleAcceptAll}
                                            className="flex-1 bg-gold hover:bg-white text-deep-black font-extrabold text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all duration-300 shadow-lg shadow-gold/15 hover:shadow-white/10 active:scale-95 cursor-pointer"
                                        >
                                            Setujui Semua
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
