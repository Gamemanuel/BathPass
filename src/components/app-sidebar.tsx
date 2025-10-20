"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUserClient } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import {NavTv} from "@/components/nav-tv";
import {
    Wallpaper,
    CalendarClock,
    NotebookPen,
    Backpack,
    ClipboardClock,
} from "lucide-react";
import {IconInnerShadowTop} from "@tabler/icons-react";

const data = {
    navMain: [
        {
            name: "View Line",
            url: "/dashboard/line",
            icon: ClipboardClock,
        },
        {
            name: "View Line",
            url: "/dashboard/line",
            icon: ClipboardClock,
        },
        {
            name: "View Line",
            url: "/dashboard/line",
            icon: ClipboardClock,
        },
    ],
    tvMode: [
        {
            name: "Manage Backgrounds",
            url: "/dashboard/backgrounds",
            icon: Wallpaper,
        },
        {
            name: "Configure Classes",
            url: "/dashboard/classes",
            icon: Backpack,
        },
        {
            name: "Configure CLO",
            url: "/dashboard/clo",
            icon: NotebookPen,
        },
        {
            name: "Edit Schedule",
            url: "/dashboard/schedule",
            icon: CalendarClock,
        },
    ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: {
        name: string
        email: string
        avatar: string
    }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                {/* TODO:// I could potentially put a icon here */}
                                {/*<IconInnerShadowTop className="!size-5" />*/}
                                <span className="text-base font-semibold">Bath Pass</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* The main Navigation menu */}
                <NavMain items={data.navMain} />
                {/* TODO:// make this hidden if tv mode is not enabled */}
                {/* The Tv mode navigation menu */}
                <NavTv items={data.tvMode} />
            </SidebarContent>
            <SidebarFooter>
                {/* 3. Pass the 'user' prop to NavUserClient */}
                <NavUserClient user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}
