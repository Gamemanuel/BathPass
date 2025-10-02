// components/nav-user.tsx

"use client"

import * as React from 'react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {EllipsisVertical, LogOut, MonitorCheck, MonitorX, Loader2} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useTvMode } from './tv-mode-context';

// The base component for display
export function NavUser({
                            user,
                        }: {
    user: {
        id: string; // ID is required to update Supabase
        name: string
        email: string
        avatar: string
    } | null
}) {
    const router = useRouter();
    const supabase = createClient();
    const { isTvMode, toggleTvMode, isLoading: isToggleLoading } = useTvMode();

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Logout failed: " + error.message);
        } else {
            router.refresh();
        }
    }

    const handleTvModeToggle = () => {
        if (user && !isToggleLoading) {
            toggleTvMode(user.id);
        }
    }


    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleTvModeToggle} disabled={isToggleLoading}>
                                {isToggleLoading ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : isTvMode ? (
                                    <MonitorX className='mr-2 h-4 w-4' />
                                ) : (
                                    <MonitorCheck className='mr-2 h-4 w-4' />
                                )}
                                {isTvMode ? 'Disable TV Mode' : 'Enable TV Mode'}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className='mr-2 h-4 w-4' />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

// Wrapper component to handle client-side fetching
export function NavUserWrapper() {
    const [user, setUser] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const supabase = createClient();
    const { updateTvModeState } = useTvMode();

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('is_tv_mode_enabled')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    updateTvModeState(profile.is_tv_mode_enabled);
                }

                setUser({
                    id: authUser.id,
                    name: authUser.user_metadata?.full_name || authUser.email || "User",
                    email: authUser.email || "No Email",
                    avatar: authUser.user_metadata?.avatar_url || "/default-avatar.png",
                });
            }
            setIsLoading(false);
        };
        fetchUser();
    }, [supabase, updateTvModeState]);

    if (isLoading) {
        return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
    }

    if (!user) {
        return null;
    }

    return <NavUser user={user} />;
}