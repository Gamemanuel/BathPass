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
    Row,
    SortingState,
    VisibilityState,
    ColumnFiltersState, getFilteredRowModel,
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
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from "lucide-react"
import { Pass, getColumns } from './columns'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'
import { toast } from "sonner"
import { Label } from '@/components/ui/label'

// DND Imports
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"


interface DataTableProps {
    data: Pass[]
}

// --- Draggable Row Component (from the example) ---

function DraggableRow({ row }: { row: Row<Pass> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

// --- Main DataTable Component ---

export function DataTable({ data: initialData }: DataTableProps) {
    const [tableData, setTableData] = React.useState(initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

    const router = useRouter()
    const supabase = createClient()
    const sortableId = React.useId()

    // DND Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    // Data IDs for DND context
    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => tableData.map(({ id }) => id) || [],
        [tableData]
    )

    // Supabase Real-time Listener
    React.useEffect(() => {
        setTableData(initialData)

        const channel = supabase
            .channel('realtime passes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bathroom_passes' }, // Targeting new table
                () => {
                    // Refreshes the server component data
                    router.refresh();
                }
            ).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [initialData, supabase, router])

    const handleUpdateRow = React.useCallback(async (id: string, field: keyof Pass, value: string | null): Promise<void> => {
        let dbField: string;
        const dbValue: string | null = value;

        // Map component field to database column name
        switch (field) {
            case 'name':
                dbField = 'student_name';
                break;
            case 'time_returned':
                dbField = 'time_in';
                break;
            case 'destination':
                dbField = 'destination';
                break;
            default:
                console.error(`Attempted to update unhandled field: ${field}`);
                toast.error(`Cannot update field: ${field}.`);
                return;
        }

        // 1. Update the database
        const { error } = await supabase
            .from('bathroom_passes') // Using the new table name
            .update({ [dbField]: dbValue })
            .eq('id', id)

        if (error) {
            console.error('Error updating row:', error)
            toast.error(`Failed to update ${dbField} for pass ${id}.`)
        } else {
            toast.success(`Successfully updated ${dbField}.`)
            // The router.refresh/realtime listener will reload the data with the new DB-calculated `time_total`.
        }
    }, [supabase]);


    const handleDragEnd = React.useCallback((event: DragEndEvent) => {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setTableData((data) => {
                const oldIndex = dataIds.findIndex(id => id === active.id)
                const newIndex = dataIds.findIndex(id => id === over.id)
                const newData = arrayMove(data, oldIndex, newIndex)

                // NOTE: Add logic here to update a 'sequence' column in Supabase for persistent sorting if needed

                return newData;
            })
        }
    }, [dataIds])

    // Memoize columns using the update function
    const columns = React.useMemo(() => getColumns(handleUpdateRow), [handleUpdateRow])

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const handleExport = (selectedOnly: boolean) => {
        const rowsToExp = selectedOnly ? table.getFilteredSelectedRowModel().rows : table.getCoreRowModel().rows;
        const dataToExport = rowsToExp.map(row => row.original);

        const csvData = dataToExport.map(row => ({
            "Student Name": row.name,
            "Destination": row.destination,
            "Time Out": row.time_out ? new Date(row.time_out).toLocaleString() : '',
            "Time In": row.time_returned ? new Date(row.time_returned).toLocaleString() : '',
            "Time Total (DB)": row.time_total || '',
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'bathroom_pass_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport(true)} disabled={Object.keys(rowSelection).length === 0}>
                        Export Selected
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(false)}>Export All .CSV</Button>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                    id={sortableId}
                >
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {table.getRowModel().rows?.length ? (
                                <SortableContext
                                    items={dataIds}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {table.getRowModel().rows.map((row) => (
                                        <DraggableRow key={row.id} row={row} />
                                    ))}
                                </SortableContext>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-0 pt-4">
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue
                                    placeholder={table.getState().pagination.pageSize}
                                />
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
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeftIcon className='w-4 h-4' />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 p-0"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeftIcon className='w-4 h-4' />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 p-0"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRightIcon className='w-4 h-4' />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 p-0 lg:flex"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRightIcon className='w-4 h-4' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}