"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { EllipsisVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TableCellViewer from "./TableCellViewer"
import { format } from "date-fns"

// Define the type for our pass data (Updated for new schema/aliases)
export type Pass = {
    id: string; // uuid
    name: string | null; // student_name
    destination: string | null; // destination
    time_out: string | null; // time_out
    time_returned: string | null; // time_in
    time_total: string | null; // interval calculated by DB trigger
};

// Utility function to format the PostgreSQL interval string for display
const formatInterval = (interval: string | null): string => {
    if (!interval) return 'N/A';
    // Matches patterns like "2 days 01:00:00" or just "01:00:00"
    const match = interval.match(/(?:(\d+) days? )?(\d{2}):(\d{2}):(\d{2})/)
    if (match) {
        const [,,h,m,s] = match.map(Number);
        const days = parseInt(match[1] || '0');
        let totalTime = "";
        if (days > 0) totalTime += `${days}d `;
        if (h > 0) totalTime += `${h}h `;
        totalTime += `${m}m ${s}s`;
        return totalTime.trim();
    }
    return interval; // Fallback
}


// Define the columns for the table
export const getColumns = (
    handleUpdateRow: (id: string, field: keyof Pass, value: string | null) => Promise<void>
): ColumnDef<Pass>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name", // student_name alias
        header: "Student Name", // Renamed Header
        cell: ({ row }) => {
            return <TableCellViewer item={row.original} handleUpdateRow={handleUpdateRow} />
        },
        enableHiding: false,
    },
    {
        accessorKey: "destination",
        header: "Destination",
    },
    {
        accessorKey: "time_out",
        header: "Time Out",
        cell: ({ row }) => (
            <div>{row.original.time_out ? format(new Date(row.original.time_out), "MMM dd, yyyy HH:mm") : 'N/A'}</div>
        ),
    },
    {
        accessorKey: 'time_returned', // time_in alias
        header: 'Time In', // Renamed Time Returned to Time In
        cell: ({ row }) => (
            <div>{row.original.time_returned ? format(new Date(row.original.time_returned), "MMM dd, yyyy HH:mm") : 'N/A'}</div>
        ),
    },
    {
        accessorKey: "time_total", // NEW DB-calculated interval
        header: "Time Total",
        cell: ({ row }) => formatInterval(row.original.time_total), // Use DB interval
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                    >
                        <EllipsisVertical />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem>Mark Returned</DropdownMenuItem>
                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Delete Pass</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];