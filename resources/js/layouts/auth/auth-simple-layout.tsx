import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '@/components/Preloader';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-[#050505] text-[#ededec] p-6 md:p-10 selection:bg-[#c5a880] selection:text-black font-sans">
            {/* Custom Preloader */}
            <Preloader />

            {/* Custom Interactive Follower Cursor */}
            <CustomCursor />

            {/* Background glowing circle */}
            <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-sm z-10">
                <div className="flex flex-col gap-6 bg-[#111111]/85 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <span className="font-outfit text-2xl font-extrabold tracking-widest text-white">
                                YURI<span className="text-gold">HOMESTAY</span>
                            </span>
                        </Link>

                        <div className="space-y-1.5 text-center mt-2">
                            <h1 className="text-xl font-bold font-outfit text-white tracking-tight">{title}</h1>
                            {description && (
                                <p className="text-center text-xs text-white/50 leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
