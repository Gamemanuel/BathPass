import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import React from "react"

export default async function Page() {
    const supabase = await createClient()

    // Check if the User is Logged in by calling the supabase cookies
    const {
        data: {user},
    } = await supabase.auth.getUser()

    // If there is no logged-in user, then redirect the user to the login page this prevents unauthorized access.
    if (!user) {
        redirect("/login")
    }

    // Fetch data from the Supabase view on the server
    const {data, error} = await supabase
        // This is the table with the data and the calculated duration time. this is not the table that we send data to fyi.
        .from("bathroom_passes_with_duration")
        // Select everything in the table
        .select("*")
        // Don't sort by time out from top to bottom
        .order("time_out", {ascending: false})

    if (error) {
        console.error("Error fetching data:", error)
        // We can Add an error state here, but I am lazy and we don't need it.
        // TODO:(FEATURE) add toast in the top right corner under the user icon with the error message.
    }

    // Pass the fetched supabase data as the initialData prop so we can feed it to the Data-table component.
    const initialData = data || []

    return (
        <SidebarProvider
            style={
                // Define the Root CSS variables for the project
                {
                    // This is the height of the navigation header. this is a static variable and should not change.
                    "--header-height": "calc(var(--spacing) * 16)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                {/* The Navigation Bar for the website. We pass the --header-height variable into it. */}
                <SiteHeader/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* Pass the Supabase data that we just fetched into the data-table component*/}
                            <DataTable initialData={initialData}/>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )

}
