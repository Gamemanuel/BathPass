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
import {NavTv} from "@/components/sidebar/nav-tv";
import {data} from "@/components/sidebar/data"
import {NavUser} from "@/components/sidebar/nav-user/nav-user-server";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
