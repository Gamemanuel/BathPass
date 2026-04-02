"use client"

import * as React from "react"
import { NavMain } from "@/components/sidebar/nav-main"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavTv } from "@/components/sidebar/nav-tv"
import { data } from "@/components/sidebar/data"
import { NavUser } from "@/components/sidebar/nav-user/nav-user-server"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [search, setSearch] = React.useState("")

    const filteredNav = React.useMemo(
        () => data.navMain.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
        [search]
    )
    const filteredTv = React.useMemo(
        () => data.tvMode.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
        [search]
    )

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
                                <span className="text-base font-semibold">Bath Pass</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* Search bar */}
                <div className="relative px-1 pb-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredNav} />
                <NavTv items={filteredTv} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}

