import {Checkbox} from "@/components/ui/checkbox";
import {ColumnDef} from "@tanstack/react-table";
import {BathroomPass} from "@/app/dashboard/components/table-schema";

export const columns: ColumnDef<BathroomPass>[] = [
    // Checkbox Cell
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                {/* Checkbox that selects all the rows for export*/}
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
                {/* Checkbox that adds the row to the list of exports */}
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
    // Name Cell
    {
        accessorKey: "name",
        // what is displayed in the header tab
        header: () => <div>Name</div>,
        // what is displayed in the rows. this is taken from supabase.
        cell: ({ row }) => <div>{row.original.name}</div>
    },
    // Destination Cell. I did nothing fancy to this cell
    {
        accessorKey: "destination",
        header: "Destination",
    },
    // Time Out Cell that is formated as a time string
    {
        accessorKey: "time_out",
        header: "Time Out",
        // take the input from supabase and translate it into date format
        cell: ({ row }) => new Date(row.original.time_out).toLocaleTimeString(),
    },
    // Time In Cell that is formated as a time string
    {
        accessorKey: "time_in",
        header: "Time In",
        // take the input from supabase and translate it into date format if there is data otherwise it displays "not returned"
        cell: ({ row }) =>
            row.original.time_in
                ? new Date(row.original.time_in).toLocaleTimeString()
                : "Not returned",
    },
    // Total Time cell
    {
        accessorKey: "total_time_spent",
        header: "Total Time",
        cell: ({ row }) => row.original.total_time_spent || "...",
    },
]
