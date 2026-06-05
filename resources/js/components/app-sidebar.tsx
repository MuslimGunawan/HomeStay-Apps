import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Home, 
    Compass, 
    Heart, 
    Hotel, 
    CalendarCheck, 
    Users, 
    Settings, 
    Sparkles, 
    CreditCard,
    ClipboardList,
    AlertOctagon,
    HelpCircle
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const role = user?.role;

    const mainNavItems: NavItem[] = [];

    if (role === 'guest') {
        mainNavItems.push(
            {
                title: 'Beranda',
                href: '/',
                icon: Home,
            },
            {
                title: 'Cari Kamar',
                href: '/explore',
                icon: Compass,
            },
            {
                title: 'Dashboard Tamu',
                href: '/guest/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Favorit Saya',
                href: '/guest/wishlist',
                icon: Heart,
            }
        );
    } else if (role === 'host') {
        mainNavItems.push(
            {
                title: 'Dashboard Host',
                href: '/host/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Homestay Saya',
                href: '/host/homestays',
                icon: Hotel,
            },
            {
                title: 'Reservasi Masuk',
                href: '/host/reservations',
                icon: CalendarCheck,
            },
            {
                title: 'Tamu Menginap',
                href: '/host/active-stays',
                icon: Users,
            },
            {
                title: 'Keluhan Tamu',
                href: '/host/complaints',
                icon: AlertOctagon,
            }
        );
    } else if (role === 'admin') {
        mainNavItems.push(
            {
                title: 'Dashboard Admin',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Kelola Kamar',
                href: '/admin/homestays',
                icon: Hotel,
            },
            {
                title: 'Reservasi Masuk',
                href: '/admin/reservations',
                icon: CalendarCheck,
            },
            {
                title: 'Tamu Menginap',
                href: '/admin/active-stays',
                icon: Users,
            },
            {
                title: 'Keluhan Tamu',
                href: '/admin/complaints',
                icon: AlertOctagon,
            },
            {
                title: 'Kelola Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Metode Pembayaran',
                href: '/admin/payments',
                icon: CreditCard,
            },
            {
                title: 'Fasilitas Global',
                href: '/admin/amenities',
                icon: Sparkles,
            },
            {
                title: 'Tiket Bantuan',
                href: '/admin/support',
                icon: ClipboardList,
            },
            {
                title: 'Konfigurasi Branding',
                href: '/admin/settings/branding',
                icon: Settings,
            }
        );
    } else {
        mainNavItems.push({
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Beranda Publik',
            href: '/',
            icon: Home,
        },
        {
            title: 'Pusat Bantuan',
            href: '/help',
            icon: HelpCircle,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

