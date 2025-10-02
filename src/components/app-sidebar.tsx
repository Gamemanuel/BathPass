// components/app-sidebar.tsx
"use client"

import * as React from "react"
import {
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUserWrapper } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"


// Static data matching the visual block
const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Students",
            url: "#",
            icon: IconUsers,
        },
        {
            title: "Analytics",
            url: "#",
            icon: IconChartBar,
        },
        {
            title: "Schedules",
            url: "#",
            icon: IconFolder,
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
    documents: [
        {
            name: "Data Export",
            url: "#",
            icon: IconDatabase,
        },
        {
            name: "Reports",
            url: "#",
            icon: IconReport,
        },
        {
            name: "Templates",
            url: "#",
            icon: IconFileWord,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        // Set to 'always' to keep the sidebar visible and wide
        <Sidebar collapsible="always" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">BathPass Admin</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Main navigation links */}
                <NavMain items={data.navMain} />

                {/* Documents section */}
                <NavDocuments items={data.documents} />

                {/* Secondary links */}
                <NavSecondary items={data.navSecondary} />
            </SidebarContent>
            <SidebarFooter>
                {/* NavUserWrapper fetches and displays the user details */}
                <NavUserWrapper />
            </SidebarFooter>
        </Sidebar>
    )
}