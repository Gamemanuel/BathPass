"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import TimePicker from "@/components/time-picker";

// Define the type for our pass data
export type Pass = {
    id: string;
    name: string | null;
    destination: string | null;
    time_out: string | null;
    time_returned: string | null;
};

// ... (calculateTimeGone function remains the same)
const calculateTimeGone = (start: string | null, end: string | null): string => {
    if (!start || !end) return 'N/A'
    try {
        const startTime = new Date(start).getTime()
        const endTime = new Date(end).getTime()
        if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return 'Invalid'

        const diff = endTime - startTime
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    } catch (e) {
        return 'Error'
    }
}


// Define the columns for the table
export const getColumns = (
    handleUpdateRow: (id: string, field: keyof Pass, value: string | null) => void
): ColumnDef<Pass>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <div className="p-2">

            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"

            />
                </div>
        ),
        cell: ({ row }) => (
            <div className="p-2">

            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            // Use the row's value directly for uncontrolled but stateful input
            return (
                <Input
                    defaultValue={row.original.name || ""}
                    onBlur={(e) => handleUpdateRow(row.original.id, 'name', e.target.value)}
                    className="bg-transparent border-gray-600"
                />
            )
        },
    },
    {
        accessorKey: "destination",
        header: "Destination",
    },
    {
        accessorKey: "time_out",
        header: "Time Out",
        cell: ({ row }) => (
            <div>{row.original.time_out ? new Date(row.original.time_out).toLocaleString() : 'N/A'}</div>
        ),
    },
    {
        accessorKey: 'time_returned',
        header: 'Time Returned',
        cell: ({ row }) => (
            <TimePicker
                value={row.original.time_returned}
                onChange={(nextIso) =>
                    handleUpdateRow(row.original.id, 'time_returned', nextIso)
                }
            />
        ),
    },
    {
        id: "time_gone",
        header: "Time Gone",
        cell: ({ row }) => calculateTimeGone(row.original.time_out, row.original.time_returned),
    },
];