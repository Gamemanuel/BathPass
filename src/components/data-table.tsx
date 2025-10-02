// src/components/data-table.tsx

"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    ColumnFiltersState,
    SortingState,
    Row,
} from "@tanstack/react-table"
import { IconSearch, IconFilter, IconDotsVertical, IconCheck, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// --- INTERFACES AND UTILITIES ---

export interface Pass {
    id: string;
    name: string; // Maps to student_name in DB
    destination: string;
    timeOut: string | null; // Maps to time_out in DB
    timeIn: string | null;   // Maps to time_in in DB
}

function formatTime(isoString: string | null): string {
    if (!isoString) return "—";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "Invalid Time";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    } catch {
        return "Invalid Time";
    }
}

// @ts-expect-error becuase jsx is weilr
function calculateDuration(timeOutStr: string | null, timeInStr: string | null): string | JSX.Element {
    if (!timeOutStr) return "N/A";
    const timeOut = new Date(timeOutStr);
    const timeIn = timeInStr ? new Date(timeInStr) : new Date();
    if (isNaN(timeOut.getTime())) return <span className="text-destructive">Invalid Time</span>;

    const durationMs = timeIn.getTime() - timeOut.getTime();
    if (durationMs < 0) return <span className="text-destructive">Error</span>;

    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formattedTime = '';
    if (hours > 0) formattedTime += `${hours}h `;
    formattedTime += `${minutes}m`;
    if (!timeInStr && hours === 0) formattedTime += ` ${seconds}s`;

    return formattedTime.trim();
}

const handleNameClick = (pass: Pass) => {
    toast.info(`Fetching detailed analytics for ${pass.name}...`);
}


// --- CORE LOGIC FOR PASS COMPLETION ---

const completePass = async (passId: string, onRefetch: () => void) => {
    const supabase = createClient();

    const { error } = await supabase
        .from('passes')
        .update({ time_in: new Date().toISOString() }) // Set time_in to current time
        .eq('id', passId);

    if (error) {
        console.error("Error completing pass:", error);
        toast.error("Failed to complete pass. Check RLS policies.");
    } else {
        toast.success(`Pass for ID: ${passId.substring(0, 8)}... marked as returned.`);
        onRefetch(); // Trigger the dashboard to reload data
    }
}


// --- COLUMN DEFINITIONS ---

const getColumns = (onDataRefetch: () => void, isHistoryTable: boolean): ColumnDef<Pass>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <Button
                variant="link"
                onClick={() => handleNameClick(row.original)}
                className="p-0 h-auto text-left font-medium"
            >
                {row.original.name}
            </Button>
        ),
    },
    {
        accessorKey: "destination",
        header: "Destination",
        cell: ({ row }) => row.original.destination,
    },
    {
        accessorKey: "timeOut",
        header: "Time Out",
        cell: ({ row }) => formatTime(row.original.timeOut),
    },
    {
        accessorKey: "timeIn",
        header: "Time In",
        cell: ({ row }) => formatTime(row.original.timeIn),
    },
    {
        id: "timeTotal", // Calculated field
        header: "Time Total",
        cell: ({ row }) => calculateDuration(row.original.timeOut, row.original.timeIn),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <IconDotsVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">

                    {/* Action to COMPLETE the pass (only shown for ACTIVE passes) */}
                    {!isHistoryTable && (
                        <DropdownMenuItem
                            onClick={() => completePass(row.original.id, onDataRefetch)}
                            className="font-medium text-green-600"
                        >
                            <IconCheck className="h-4 w-4 mr-2" /> Mark Returned
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => toast.info("Editing enabled!")}>
                        Edit Pass Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Export Student Data (.CSV)</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

// --- DATATABLE COMPONENT ---

export function DataTable({
                              data: initialData = [],
                              teacherId,
                              onDataRefetch,
                          }: {
    data: Pass[]
    teacherId?: string
    onDataRefetch: () => void
}) {
    const [data] = React.useState(initialData)
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [timeTotalFilter, setTimeTotalFilter] = React.useState<number | ''>('')
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const isHistoryTable = initialData.length > 0 ? !!initialData[0].timeIn : false;

    const filterTimeTotal = React.useCallback((row: Row<Pass>, columnId: string, filterValue: number) => {
        if (!filterValue) return true;

        const pass = row.original;
        if (!pass.timeOut || !pass.timeIn) return false;

        const durationMs = new Date(pass.timeIn).getTime() - new Date(pass.timeOut).getTime();
        const durationMinutes = Math.floor(durationMs / 1000 / 60);

        return durationMinutes >= filterValue;
    }, []);

    const tableColumns = React.useMemo(() => {
        return getColumns(onDataRefetch, isHistoryTable).map(col => {
            if (col.id === 'timeTotal') {
                return {
                    ...col,
                    filterFn: filterTimeTotal,
                };
            }
            return col;
        });
    }, [onDataRefetch, isHistoryTable, filterTimeTotal]);


    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            columnFilters,
            sorting,
            pagination,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
    })

    React.useEffect(() => {
        const filterValue = timeTotalFilter || undefined;
        table.getColumn("timeTotal")?.setFilterValue(filterValue);
    }, [timeTotalFilter, table]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {/* Name Search */}
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="Search by name..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-9"
                    />
                    <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Time Total Filter (only for History) */}
                {isHistoryTable && (
                    <div className="relative flex items-center gap-2">
                        <IconFilter className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="number"
                            placeholder="Min Duration (min)"
                            value={timeTotalFilter || ''}
                            onChange={(e) => setTimeTotalFilter(Number(e.target.value) || '')}
                            className="w-36"
                        />
                    </div>
                )}

                {/* Export Button (Full table export) */}
                <Button variant="outline" className="ml-auto">
                    <IconFilter className="h-4 w-4 mr-2" /> Export CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
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
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                    No passes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} records.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IconChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IconChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <IconChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <IconChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}