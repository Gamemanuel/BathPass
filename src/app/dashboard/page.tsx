// page.tsx
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation" // Import redirect
import React from "react"

export default async function Page() {
    const supabase = await createClient()

    // Check for an authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // If no user, redirect to a login page (assuming you have one at /login)
    if (!user) {
        redirect("/login")
    }

    // Fetch data from the Supabase view on the server
    const { data, error } = await supabase
        .from("bathroom_passes_with_duration")
        .select("*")
        .order("time_out", { ascending: false })

    if (error) {
        console.error("Error fetching data:", error)
        // We can Add an error state here
    }

    // Pass the fetched data as the initialData prop
    const initialData = data || []

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 16)",
                } as React.CSSProperties
            }
        >
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <DataTable initialData={initialData} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}