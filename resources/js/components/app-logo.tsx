import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name, logo } = usePage().props as any;
    const appName = name || 'Yuri-HomeStay';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#111] text-sidebar-primary-foreground overflow-hidden border border-white/5">
                {logo && logo !== '/images/logo.png' && logo !== '/logo.png' ? (
                    <img src={logo} alt="Logo" className="h-full w-full object-contain p-1" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
