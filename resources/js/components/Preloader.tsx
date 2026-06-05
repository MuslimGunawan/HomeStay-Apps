import { useEffect, useState } from 'react';

export default function Preloader() {
    const [loading, setLoading] = useState(true);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // 1.5s beautiful showcase

        const hideTimer = setTimeout(() => {
            setHidden(true);
        }, 2200);

        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (hidden) return null;

    return (
        <div
            className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-deep-black text-gold transition-all duration-[800ms] cubic-bezier(0.77, 0, 0.175, 1) ${
                !loading ? 'pointer-events-none opacity-0 scale-105' : 'opacity-100'
            }`}
        >
            <div className="flex flex-col items-center space-y-4">
                {/* Diamond Rotating Logo Spinner */}
                <div className="relative h-16 w-16 animate-[spin_3s_linear_infinite]">
                    <div className="absolute inset-0 rotate-45 border-2 border-gold/20"></div>
                    <div className="absolute inset-0 rotate-45 border-2 border-gold border-t-transparent border-r-transparent animate-[pulse_1.5s_infinite]"></div>
                </div>

                {/* Animated Brand Inisial */}
                <h1 className="font-outfit text-3xl font-extrabold tracking-[0.25em] text-white">
                    HOME<span className="text-gold">STAY</span>
                </h1>
                
                {/* Gold loading indicator */}
                <div className="h-[2px] w-24 overflow-hidden bg-white/10 rounded-full">
                    <div className="h-full w-full bg-gold rounded-full animate-[loading_1.5s_ease-in-out_infinite] origin-left"></div>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(1); }
                    100% { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}
