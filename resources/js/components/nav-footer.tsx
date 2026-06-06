import type { ComponentPropsWithoutRef } from 'react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 px-3 py-4 border-t border-white/5 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-xl px-4 py-3 h-10 border-l-2 border-transparent group"
                            >
                                <a
                                    href={toUrl(item.href)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3.5"
                                >
                                    {item.icon && (
                                        <item.icon className="h-4.5 w-4.5 text-neutral-400 group-hover:text-white transition-colors" />
                                    )}
                                    <span className="font-sans text-xs tracking-wide">{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
