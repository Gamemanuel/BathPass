'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Pass, getColumns } from './columns'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'

interface DataTableProps {
    data: Pass[]
}

export function DataTable({ data }: DataTableProps) {
    const [tableData, setTableData] = React.useState(data)
    const [rowSelection, setRowSelection] = React.useState({})
    const router = useRouter()
    const supabase = createClient()

    // Update local state when server-provided data changes
    React.useEffect(() => {
        setTableData(data)
    }, [data])

    // Set up real-time listener
    React.useEffect(() => {
        const channel = supabase
            .channel('realtime passes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'passes' },
                (payload) => {
                    // This refreshes the server component data without a full page reload
                    router.refresh();
                }
            ).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    const handleUpdateRow = async (id: string, field: keyof Pass, value: string | null) => {
        // 1. Update local state immediately for a snappy UI
        setTableData(prevData =>
            prevData.map(row => (row.id === id ? { ...row, [field]: value } : row))
        );

        // 2. Update the database in the background
        const { error } = await supabase
            .from('passes')
            .update({ [field]: value })
            .eq('id', id)
        if (error) {
            console.error('Error updating row:', error)
            // Optional: Add toast notification for error
        }
    }

    // Memoize columns to prevent re-creation on every render
    const columns = React.useMemo(() => getColumns(handleUpdateRow), [])

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
        // This allows the table to update when `tableData` state changes
        manualPagination: false,
    })

    const handleExport = (selectedOnly: boolean) => {
        const rowsToExp = selectedOnly ? table.getFilteredSelectedRowModel().rows : table.getCoreRowModel().rows;
        const dataToExport = rowsToExp.map(row => row.original);

        const csvData = dataToExport.map(row => ({
            Name: row.name,
            Destination: row.destination,
            "Time Out": row.time_out ? new Date(row.time_out).toLocaleString() : '',
            "Time Returned": row.time_returned ? new Date(row.time_returned).toLocaleString() : '',
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'bath_pass_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => handleExport(true)} disabled={Object.keys(rowSelection).length === 0}>
                    Export Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport(false)}>Export All as .CSV</Button>
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
                                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
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
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}