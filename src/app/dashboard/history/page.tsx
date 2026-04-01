"use client"

import React, { useState, useCallback } from "react"
import { useClasses } from "@/hooks/useClasses"
import { useSignOuts } from "@/hooks/useSignOuts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DownloadIcon, History, Search } from "lucide-react"
import { toast } from "sonner"

export default function HistoryPage() {
    const { classes } = useClasses()
    const [selectedClassId, setSelectedClassId] = useState<string>("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [search, setSearch] = useState("")

    const classId = selectedClassId === "all" ? undefined : selectedClassId
    const { signOuts, loading } = useSignOuts(classId)

    // Filter by date range and search on client side
    const filtered = signOuts.filter((s) => {
        const timeOut = new Date(s.time_out)
        if (startDate && timeOut < new Date(startDate)) return false
        if (endDate) {
            const end = new Date(endDate)
            end.setDate(end.getDate() + 1)
            if (timeOut >= end) return false
        }
        if (search) {
            const q = search.toLowerCase()
            if (!s.student_name.toLowerCase().includes(q) &&
                !(s.destination ?? "").toLowerCase().includes(q) &&
                !(s.student_id ?? "").toLowerCase().includes(q)) {
                return false
            }
        }
        return true
    })

    const handleExport = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (selectedClassId !== "all") params.set("classId", selectedClassId)
            if (startDate) params.set("startDate", startDate)
            if (endDate) params.set("endDate", endDate)

            const res = await fetch(`/api/exports?${params.toString()}`)
            if (!res.ok) throw new Error("Export failed")

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `bathpass-export-${new Date().toISOString().split("T")[0]}.csv`
            link.click()
            URL.revokeObjectURL(url)
            toast.success("Export downloaded")
        } catch {
            toast.error("Failed to export data")
        }
    }, [selectedClassId, startDate, endDate])

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">History</h2>
                    <p className="text-muted-foreground">
                        View and export student sign-out history.
                    </p>
                </div>
                <Button className="gap-2" onClick={handleExport}>
                    <DownloadIcon className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                    <CardDescription>Filter sign-out history by class and date range</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label>Class</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name or destination..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {loading ? "Loading..." : `${filtered.length} records`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <History className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No records found</p>
                        </div>
                    ) : (
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Time Out</TableHead>
                                        <TableHead>Time In</TableHead>
                                        <TableHead>Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">{row.student_name}</TableCell>
                                            <TableCell>{row.destination ?? "—"}</TableCell>
                                            <TableCell>
                                                {new Date(row.time_out).toLocaleString([], {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {row.time_in
                                                    ? new Date(row.time_in).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : "Not returned"}
                                            </TableCell>
                                            <TableCell>{row.total_time_spent ?? "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
