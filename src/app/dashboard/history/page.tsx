"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useClasses } from "@/hooks/useClasses"
import { useSignOuts } from "@/hooks/useSignOuts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select as SelectPagination, SelectContent as SC, SelectItem as SI, SelectTrigger as ST, SelectValue as SV } from "@/components/ui/select"
import { TimePicker, type TimeValue } from "@/components/time-picker"
import { CalendarIcon, DownloadIcon, Pencil, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, History } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import Papa from "papaparse"
import type { SignOut } from "@/types"

function timeValueTo24(tv: TimeValue): string {
    let h = tv.hour
    if (tv.period === "PM" && h !== 12) h += 12
    if (tv.period === "AM" && h === 12) h = 0
    return `${String(h).padStart(2, "0")}:${String(tv.minute).padStart(2, "0")}:00`
}

function dateTimeTo24TimeValue(dt: Date): TimeValue {
    const h = dt.getHours()
    const period = h < 12 ? "AM" : "PM"
    const displayH = h % 12 || 12
    return { hour: displayH, minute: dt.getMinutes(), period }
}

function EditDialog({
    signOut,
    open,
    onClose,
    onSaved,
}: {
    signOut: SignOut
    open: boolean
    onClose: () => void
    onSaved: () => void
}) {
    const timeOutDate = new Date(signOut.time_out)
    const timeInDate = signOut.time_in ? new Date(signOut.time_in) : null

    const [timeOutVal, setTimeOutVal] = useState<TimeValue>(dateTimeTo24TimeValue(timeOutDate))
    const [timeInVal, setTimeInVal] = useState<TimeValue | null>(
        timeInDate ? dateTimeTo24TimeValue(timeInDate) : null
    )
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            // Build new ISO strings preserving the original date
            const buildISO = (original: Date, tv: TimeValue) => {
                const hh = timeValueTo24(tv)
                return `${original.toISOString().split("T")[0]}T${hh}`
            }
            const newTimeOut = buildISO(timeOutDate, timeOutVal)
            const newTimeIn = timeInVal && timeInDate ? buildISO(timeInDate, timeInVal) : undefined

            const body: Record<string, string> = { time_out: newTimeOut }
            if (newTimeIn) body.time_in = newTimeIn

            const res = await fetch(`/api/signouts/${signOut.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error("Failed to update")
            toast.success("Times updated")
            onSaved()
            onClose()
        } catch {
            toast.error("Failed to update times")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit Times — {signOut.student_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Time Out</Label>
                        <TimePicker value={timeOutVal} onChange={setTimeOutVal} />
                    </div>
                    {timeInDate && (
                        <div className="space-y-2">
                            <Label>Time In</Label>
                            <TimePicker
                                value={timeInVal ?? dateTimeTo24TimeValue(timeInDate)}
                                onChange={setTimeInVal}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DatePickerButton({ label, date, onSelect }: {
    label: string
    date: Date | undefined
    onSelect: (d: Date | undefined) => void
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {date ? format(date, "PP") : <span className="text-muted-foreground">{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus />
            </PopoverContent>
        </Popover>
    )
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export default function HistoryPage() {
    const { classes } = useClasses()
    const [selectedClassId, setSelectedClassId] = useState<string>("all")
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [search, setSearch] = useState("")
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [editTarget, setEditTarget] = useState<SignOut | null>(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const classId = selectedClassId === "all" ? undefined : selectedClassId
    const { signOuts, loading, fetchSignOuts } = useSignOuts(classId)

    const filtered = useMemo(() => {
        return signOuts.filter((s) => {
            const timeOut = new Date(s.time_out)
            if (startDate) {
                const sd = new Date(startDate); sd.setHours(0, 0, 0, 0)
                if (timeOut < sd) return false
            }
            if (endDate) {
                const ed = new Date(endDate); ed.setHours(23, 59, 59, 999)
                if (timeOut > ed) return false
            }
            if (search) {
                const q = search.toLowerCase()
                if (
                    !s.student_name.toLowerCase().includes(q) &&
                    !(s.destination ?? "").toLowerCase().includes(q) &&
                    !(s.student_id ?? "").toLowerCase().includes(q)
                ) return false
            }
            return true
        })
    }, [signOuts, startDate, endDate, search])

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
    const pagedRows = useMemo(
        () => filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        [filtered, pageIndex, pageSize]
    )

    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    const selectedRows = filtered.filter((s) => rowSelection[s.id])

    const allPageSelected = pagedRows.length > 0 && pagedRows.every((r) => rowSelection[r.id])
    const somePageSelected = pagedRows.some((r) => rowSelection[r.id])

    const toggleAll = () => {
        if (allPageSelected) {
            setRowSelection((prev) => {
                const next = { ...prev }
                pagedRows.forEach((r) => delete next[r.id])
                return next
            })
        } else {
            setRowSelection((prev) => {
                const next = { ...prev }
                pagedRows.forEach((r) => { next[r.id] = true })
                return next
            })
        }
    }

    const exportRows = useCallback((rows: SignOut[], fileName: string) => {
        const csv = Papa.unparse(rows.map((r) => ({
            student_name: r.student_name,
            student_id: r.student_id ?? "",
            destination: r.destination ?? "",
            time_out: r.time_out,
            time_in: r.time_in ?? "",
            total_time_spent: r.total_time_spent ?? "",
        })))
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${fileName}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
        toast.success("Export downloaded")
    }, [])

    const handleExportAll = () => exportRows(filtered, "bathpass-all")
    const handleExportSelected = () => {
        if (selectedRows.length === 0) { toast.error("No rows selected"); return }
        exportRows(selectedRows, "bathpass-selected")
    }

    const handlePageSizeChange = (val: string) => {
        setPageSize(Number(val))
        setPageIndex(0)
    }

    return (
        <div className="px-4 lg:px-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">History</h2>
                    <p className="text-muted-foreground text-sm">View and export student sign-out history.</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label className="text-xs">Class</Label>
                            <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setPageIndex(0) }}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Start Date</Label>
                            <DatePickerButton label="Pick start date" date={startDate} onSelect={(d) => { setStartDate(d); setPageIndex(0) }} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">End Date</Label>
                            <DatePickerButton label="Pick end date" date={endDate} onSelect={(d) => { setEndDate(d); setPageIndex(0) }} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name or destination…"
                                    className="pl-8 h-9"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPageIndex(0) }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table card */}
            <Card className="flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
                    <p className="text-sm text-muted-foreground">
                        {loading ? "Loading…" : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}${selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : ""}`}
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-8">
                                <DownloadIcon className="h-4 w-4" />
                                <span>Export</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportAll}>Export All ({filtered.length})</DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleExportSelected}
                                disabled={selectedIds.length === 0}
                            >
                                Export Selected ({selectedIds.length})
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
                <CardContent className="p-0 flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <History className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground text-sm">No records found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="w-8">
                                            <Checkbox
                                                checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                                                onCheckedChange={toggleAll}
                                                aria-label="Select all on page"
                                            />
                                        </TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time Out</TableHead>
                                        <TableHead>Time In</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pagedRows.map((row) => (
                                        <TableRow key={row.id} data-state={rowSelection[row.id] ? "selected" : undefined}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={!!rowSelection[row.id]}
                                                    onCheckedChange={(v) =>
                                                        setRowSelection((prev) => ({ ...prev, [row.id]: !!v }))
                                                    }
                                                    aria-label="Select row"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{row.student_name}</TableCell>
                                            <TableCell>{row.destination ?? "—"}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(row.time_out).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(row.time_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </TableCell>
                                            <TableCell>
                                                {row.time_in
                                                    ? new Date(row.time_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                    : <span className="text-muted-foreground text-xs">Not returned</span>}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{row.total_time_spent ?? "—"}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => setEditTarget(row)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {/* Pagination */}
                {!loading && filtered.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t text-sm flex-wrap gap-2">
                        <div className="text-muted-foreground text-xs">
                            {selectedIds.length} of {filtered.length} selected
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Rows</span>
                                <SelectPagination value={String(pageSize)} onValueChange={handlePageSizeChange}>
                                    <ST className="h-7 w-16 text-xs"><SV /></ST>
                                    <SC side="top">
                                        {PAGE_SIZE_OPTIONS.map((n) => (
                                            <SI key={n} value={String(n)}>{n}</SI>
                                        ))}
                                    </SC>
                                </SelectPagination>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Page {pageIndex + 1} / {pageCount}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                                    <ChevronsLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPageIndex((i) => i - 1)} disabled={pageIndex === 0}>
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPageIndex((i) => i + 1)} disabled={pageIndex >= pageCount - 1}>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
                                    <ChevronsRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Edit dialog */}
            {editTarget && (
                <EditDialog
                    signOut={editTarget}
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={fetchSignOuts}
                />
            )}
        </div>
    )
}

