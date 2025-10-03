"use client"

import * as React from "react"
import Papa from "papaparse"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    DownloadIcon,
    SearchIcon,
} from "lucide-react"

import {
    ColumnDef,
    ColumnFiltersState,
    getFilteredRowModel,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    VisibilityState, FilterFn,
} from "@tanstack/react-table"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {createClient} from "@/lib/supabase/client";
import {toast} from "sonner";

export const bathroomPassSchema = z.object({
    id: z.number(),
    name: z.string(),
    destination: z.string().nullable(),
    time_out: z.string(),
    time_in: z.string().nullable(),
    total_time_spent: z.string().nullable(),
})

type BathroomPass = z.infer<typeof bathroomPassSchema>

// 3. ADDED: Custom filter function for time search
const timeGreaterThanFilter: FilterFn<BathroomPass> = (row, columnId, filterValue) => {
    const rowTime = row.getValue(columnId) as string | null
    if (!rowTime || typeof filterValue !== 'string' || !filterValue.startsWith('>')) {
        return true // Don't filter if data is invalid or not a time query
    }

    try {
        const query = filterValue.substring(1).trim().toLowerCase()
        let querySeconds = 0

        // Parse query like "5m", "10:30"
        if (query.endsWith('m')) {
            querySeconds = parseInt(query.slice(0, -1), 10) * 60
        } else if (query.includes(':')) {
            const parts = query.split(':').map(Number)
            querySeconds = (parts[0] || 0) * 60 + (parts[1] || 0)
        } else {
            querySeconds = parseInt(query, 10) * 60 // Assume minutes if no unit
        }

        if (isNaN(querySeconds)) return true

        // Parse row time "HH:MI:SS"
        const timeParts = rowTime.split(':').map(Number)
        const rowSeconds = (timeParts[0] || 0) * 3600 + (timeParts[1] || 0) * 60 + (timeParts[2] || 0)

        return rowSeconds > querySeconds
    } catch (e) {
        return true // Don't filter on parsing error
    }
}

// 4. ADDED: Reusable Editable Cell Component
const EditableCell = ({
                          getValue,
                          row,
                          column,
                          table,
                      }: {
    getValue: () => any
    row: Row<BathroomPass>
    column: { id: string }
    table: any
}) => {
    const initialValue = getValue()
    const [value, setValue] = React.useState(initialValue)

    const onBlur = () => {
        if (value !== initialValue) {
            table.options.meta?.updateData(row.original.id, column.id, value)
        }
    }

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return (
        <Input
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="h-8 border-transparent bg-transparent p-1 shadow-none transition-colors hover:border-border focus-visible:border-ring focus-visible:bg-background"
        />
    )
}

// 5. MODIFIED: Column definitions
export const columns: ColumnDef<BathroomPass>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40, // 6. ADDED: Reduces column width
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: EditableCell, // Use the editable cell
    },
    {
        accessorKey: "destination",
        header: "Destination",
        cell: EditableCell, // Use the editable cell
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
        filterFn: timeGreaterThanFilter, // 7. ADDED: Attach custom filter
        cell: ({ row }) => row.original.total_time_spent || "...",
    },
]

export function DataTable({ initialData }: { initialData: BathroomPass[] }) {
    const [data, setData] = React.useState(initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState<string>("")
    const [activeTab, setActiveTab] = React.useState("outline") // 8. ADDED: State for active tab

    const supabase = createClient()

    // 9. ADDED: Supabase real-time subscription
    React.useEffect(() => {
        // Function to re-fetch data to get updated calculated columns
        const refetchData = async () => {
            const { data: newData, error } = await supabase
                .from("bathroom_passes_with_duration")
                .select("*")
                .order("time_out", { ascending: false })
            if (!error && newData) {
                setData(newData)
            }
        }

        const channel = supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bathroom_passes' },
                (payload) => {
                    console.log('Change received!', payload)
                    refetchData() // Refetch on any change
                }
            )
            .subscribe()

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            globalFilter,
        },
        // 10. ADDED: Custom global filter logic
        globalFilterFn: (row, columnId, filterValue) => {
            if (typeof filterValue === 'string' && filterValue.startsWith('>')) {
                // If it's a time query, only let the specific column filter handle it
                return true
            }
            // Otherwise, perform a standard text search
            const value = row.getValue(columnId) as string | number
            return String(value).toLowerCase().includes(filterValue.toLowerCase())
        },
        // 11. ADDED: Pass update function to cells via table.meta
        meta: {
            updateData: async (id: number, columnId: string, value: string) => {
                const { error } = await supabase
                    .from('bathroom_passes')
                    .update({ [columnId]: value })
                    .eq('id', id)

                if (error) {
                    toast.error(`Failed to update ${columnId}.`)
                } else {
                    toast.success("Entry updated.")
                }
            },
        },
        // ... other table options remain the same
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    // ... (handleExport function remains the same as before) ...
    const handleExport = (rows: Row<BathroomPass>[], fileName: string) => {
        const dataToExport = rows.map((row) => row.original)
        const csv = Papa.unparse(dataToExport)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `${fileName}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab} // Update active tab state
            className="flex w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <TabsList>
                    <TabsTrigger value="outline">History</TabsTrigger>
                    <TabsTrigger value="active">Active Passes</TabsTrigger>
                </TabsList>

                {/* 12. MODIFIED: Conditionally render search and export */}
                {activeTab === 'outline' && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search or type >5m"
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="h-9 w-40 pl-9 lg:w-64"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <DownloadIcon className="h-4 w-4" />
                                    <span className="hidden lg:inline">Export</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => handleExport(table.getCoreRowModel().rows, "all_passes")}
                                >
                                    Export All
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={table.getFilteredRowModel().rows.length === table.getCoreRowModel().rows.length}
                                    onClick={() => handleExport(table.getFilteredRowModel().rows, "filtered_passes")}
                                >
                                    Export Filtered
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                                    onClick={() => handleExport(table.getFilteredSelectedRowModel().rows, "selected_passes")}
                                >
                                    Export Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            <TabsContent
                value="outline"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-2">
                    <div className="text-muted-foreground flex-1 text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="active" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>
    )
}