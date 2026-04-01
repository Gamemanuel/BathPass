import type { Metadata } from "next";
import React from "react";
import {AppSidebar} from "@/components/sidebar/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {SiteHeader} from "@/components/site-header";
import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
    title: "Bath Pass — Dashboard",
    description: "Teacher dashboard for Bath Pass",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <SidebarProvider
            style={
                {
                    "--header-height": "calc(var(--spacing) * 16)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset"/>
            <SidebarInset>
                <SiteHeader/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
