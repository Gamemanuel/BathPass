import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import React from "react"

export default async function Page() {
    const supabase = await createClient()

    // Check if the User is Logged in
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // If there is no user, then redirect to the login page
    if (!user) {
        redirect("/login")
    }

    // Fetch data from the Supabase view on the server
    const { data, error } = await supabase
        .from("bathroom_passes_with_duration")
        .select("*")
        // don't sort by time out from top to bottom
        .order("time_out", { ascending: false })

    if (error) {
        console.error("Error fetching data:", error)
        // We can Add an error state here, but I am lazy and we don't need it.
        // TODO:(FEATURE) add toast in the top right corner under the user icon with the error message.
    }

    // Pass the fetched data as the initialData prop
    const initialData = data || []

    return (
        <SidebarProvider
            style={
                {
                    "--header-height": "calc(var(--spacing) * 16)",
                } as React.CSSProperties
            }
        >
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* give the table the data from supabase that we just pulled */}
                            <DataTable initialData={initialData} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}