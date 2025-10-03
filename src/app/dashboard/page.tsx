// src/app/page.tsx

import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server" // Make sure you have a Supabase client utility

export default async function Page() {
    // Fetch data from the Supabase view on the server
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("bathroom_passes_with_duration") // Query the view
        .select("*")
        .order("time_out", { ascending: false }) // Show most recent first

    if (error) {
        console.error("Error fetching data:", error)
        // You can render an error state here
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