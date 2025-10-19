"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUserClient } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {NavTv} from "@/components/nav-tv";
import {NavFooter} from "@/components/nav-footer";
import {
    Settings,
    // These inputs are commented out in the const data
    Search,
    MessageCircleQuestionMark,
    Wallpaper,
    CalendarClock,
    NotebookPen,
    Backpack, ClipboardClock, GalleryVerticalEnd,
} from "lucide-react";
import {ModeToggle} from "@/components/mode-toggle";

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
    navFooter: [
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings,
        },
        // {
        //     title: "Get Help",
        //     url: "#",
        //     icon: MessageCircleQuestionMark,
        // },
        // TODO:// figure out how to make the search bar become a command pallet.
        // {
        //     title: "Search",
        //     url: "#",
        //     icon: Search,
        // },
    ],
}

// 1. Define the props for AppSidebar, including the user
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: {
        name: string
        email: string
        avatar: string
    }
}

// 2. Accept 'user' as a prop
export function AppSidebar({ user, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                {/* 3. Pass the 'user' prop to NavUserClient */}
                <NavUserClient user={user} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavTv items={data.tvMode} />
                <NavFooter items={data.navFooter} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                {/* TODO:// maybe make the mode toggle wider? */}
                <ModeToggle/>
            </SidebarFooter>
        </Sidebar>
    )
}