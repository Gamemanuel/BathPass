"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUserClient } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {NavTv} from "@/components/nav-tv";
import {NavFooter} from "@/components/nav-footer";
import {
    // These icons where removed but they need to be added to the user tsx page.
    Settings,
    Search,
    MessageCircleQuestionMark,
    Wallpaper,
    CalendarClock,
    NotebookPen,
    Backpack,
    ClipboardClock,
} from "lucide-react";

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
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavTv items={data.tvMode} />
            </SidebarContent>
            <SidebarFooter>
                {/* 3. Pass the 'user' prop to NavUserClient */}
                <NavUserClient user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}