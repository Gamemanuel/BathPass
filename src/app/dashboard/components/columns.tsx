import {Checkbox} from "@/components/ui/checkbox";
import {ColumnDef} from "@tanstack/react-table";
import { z } from "zod";

export const bathroomPassSchema = z.object({
    id: z.number(),
    name: z.string(),
    destination: z.string().nullable(),
    time_out: z.string(),
    time_in: z.string().nullable(),
    total_time_spent: z.string().nullable(),
})

type BathroomPass = z.infer<typeof bathroomPassSchema>

export const columns: ColumnDef<BathroomPass>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
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
        accessorKey: "name",
        header: () => <div className="pl-0">Name</div>, // FIX: Remove left padding on the Name column header.
        cell: ({ row }) => <div className="pl-0">{row.original.name}</div>, // FIX: Remove left padding on the Name column cell.
    },
    {
        accessorKey: "destination",
        header: "Destination",
    },
    {
        accessorKey: "time_out",
        header: "Time Out",
        cell: ({ row }) => new Date(row.original.time_out).toLocaleTimeString(),
    },
    {
        accessorKey: "time_in",
        header: "Time In",
        cell: ({ row }) =>
            row.original.time_in
                ? new Date(row.original.time_in).toLocaleTimeString()
                : "Not returned",
    },
    {
        accessorKey: "total_time_spent",
        header: "Total Time",
        cell: ({ row }) => row.original.total_time_spent || "...",
    },
]