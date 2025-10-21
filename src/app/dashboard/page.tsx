import { DataTable } from "@/components/data-table"
import { createClient } from "@/lib/supabase/server"
import React from "react"

export default async function Page() {
    const supabase = await createClient()

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
        <div>
            {/* Pass our inital data to the data table components for rendering */}
            <DataTable initialData={initialData}/>
        </div>
    )
}
