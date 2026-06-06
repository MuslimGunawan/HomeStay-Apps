import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) {
        return null;
    }

    return (
        <SidebarMenu className="px-3 py-4 border-t border-white/5 bg-black/10">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3 h-14 hover:bg-gold/5 hover:border-gold/30 hover:text-white transition-all duration-300 data-[state=open]:bg-gold/5 data-[state=open]:border-gold/30"
                            data-test="sidebar-menu-button"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <UserInfo user={auth.user} />
                            </div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-neutral-400 group-hover:text-gold transition-colors shrink-0" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-white/10 bg-[#0f0f10] text-white p-2 shadow-2xl"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'top'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
