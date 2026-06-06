import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-6 space-y-4">
            <SidebarGroupLabel className="font-outfit text-[10px] font-bold tracking-widest text-gold uppercase mb-2 px-3">
                Platform Navigation
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`transition-all duration-300 rounded-xl px-4 py-3 h-11 flex items-center gap-3.5 border-l-2 relative overflow-hidden group ${
                                    active
                                        ? 'bg-gradient-to-r from-gold/15 to-gold/5 border-gold text-gold font-bold shadow-lg shadow-gold/5'
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5 border-transparent'
                                }`}
                            >
                                <Link href={item.href} prefetch className="w-full flex items-center gap-3">
                                    {item.icon && <item.icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-gold' : 'text-neutral-400 group-hover:text-white'}`} />}
                                    <span className="font-sans text-xs tracking-wide">{item.title}</span>
                                    {active && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gold rounded-l-full shadow-[0_0_8px_#c5a880]" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
