"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useClasses } from "@/hooks/useClasses"
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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CalendarClock, Plus, Trash2 } from "lucide-react"
import type { Schedule } from "@/types"
import { DAYS_OF_WEEK, REPEAT_TYPES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"

export default function SchedulesPage() {
    const { classes } = useClasses()
    const [selectedClassId, setSelectedClassId] = useState<string>("")
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state
    const [form, setForm] = useState({
        name: "",
        clo_time: "",
        repeat_type: "none" as Schedule["repeat_type"],
        repeat_days: [] as number[],
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        is_override: false,
        override_date: "",
    })

    const fetchSchedules = useCallback(async () => {
        if (!selectedClassId) return
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from("schedules")
            .select("*")
            .eq("class_id", selectedClassId)
            .order("start_date", { ascending: true })
        setSchedules((data as Schedule[]) ?? [])
        setLoading(false)
    }, [selectedClassId])

    useEffect(() => {
        fetchSchedules()
    }, [fetchSchedules])

    useEffect(() => {
        if (!selectedClassId && classes.length > 0) {
            setSelectedClassId(classes[0].id)
        }
    }, [classes, selectedClassId])

    const handleSave = async () => {
        if (!selectedClassId || !form.name || !form.start_date) {
            toast.error("Please fill in all required fields")
            return
        }
        setSaving(true)
        try {
            const res = await fetch("/api/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ class_id: selectedClassId, ...form }),
            })
            if (!res.ok) throw new Error("Failed to save schedule")
            toast.success("Schedule created")
            setDialogOpen(false)
            resetForm()
            await fetchSchedules()
        } catch {
            toast.error("Failed to save schedule")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this schedule?")) return
        try {
            const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            toast.success("Schedule deleted")
            await fetchSchedules()
        } catch {
            toast.error("Failed to delete schedule")
        }
    }

    const resetForm = () => {
        setForm({
            name: "",
            clo_time: "",
            repeat_type: "none",
            repeat_days: [],
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
            is_override: false,
            override_date: "",
        })
    }

    const toggleRepeatDay = (day: number) => {
        setForm((f) => ({
            ...f,
            repeat_days: f.repeat_days.includes(day)
                ? f.repeat_days.filter((d) => d !== day)
                : [...f.repeat_days, day],
        }))
    }

    const getRepeatLabel = (s: Schedule) => {
        const rt = REPEAT_TYPES.find((r) => r.value === s.repeat_type)
        if (s.repeat_type === "custom" && s.repeat_days?.length) {
            const days = s.repeat_days.map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label?.slice(0, 3)).join(", ")
            return `Custom: ${days}`
        }
        return rt?.label ?? s.repeat_type
    }

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Schedules &amp; CLO</h2>
                    <p className="text-muted-foreground">
                        Set Class Left Out (CLO) times and create repeating schedules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" disabled={!selectedClassId}>
                                <Plus className="h-4 w-4" />
                                Add Schedule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create Schedule</DialogTitle>
                                <DialogDescription>
                                    Set a CLO time and repeat pattern for this class.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                                <div className="space-y-1">
                                    <Label>Schedule Name *</Label>
                                    <Input
                                        placeholder="e.g., Regular Schedule"
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>CLO Time</Label>
                                    <Input
                                        type="time"
                                        value={form.clo_time}
                                        onChange={(e) => setForm((f) => ({ ...f, clo_time: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">Time when class is left out</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Repeat Pattern</Label>
                                    <Select
                                        value={form.repeat_type}
                                        onValueChange={(v) => setForm((f) => ({ ...f, repeat_type: v as Schedule["repeat_type"] }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REPEAT_TYPES.map((rt) => (
                                                <SelectItem key={rt.value} value={rt.value}>
                                                    {rt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {form.repeat_type === "custom" && (
                                    <div className="space-y-2">
                                        <Label>Days of Week</Label>
                                        <div className="grid grid-cols-7 gap-1">
                                            {DAYS_OF_WEEK.map((day) => (
                                                <div key={day.value} className="flex flex-col items-center gap-1">
                                                    <Checkbox
                                                        id={`day-${day.value}`}
                                                        checked={form.repeat_days.includes(day.value)}
                                                        onCheckedChange={() => toggleRepeatDay(day.value)}
                                                    />
                                                    <label htmlFor={`day-${day.value}`} className="text-xs text-muted-foreground cursor-pointer">
                                                        {day.label.slice(0, 2)}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>Start Date *</Label>
                                        <Input
                                            type="date"
                                            value={form.start_date}
                                            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                                        />
                                    </div>
                                    {form.repeat_type !== "none" && (
                                        <div className="space-y-1">
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={form.end_date}
                                                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <Label className="text-sm font-medium">Override Schedule</Label>
                                        <p className="text-xs text-muted-foreground">Mark this as an override for a specific date</p>
                                    </div>
                                    <Switch
                                        checked={form.is_override}
                                        onCheckedChange={(checked) => setForm((f) => ({ ...f, is_override: checked }))}
                                    />
                                </div>
                                {form.is_override && (
                                    <div className="space-y-1">
                                        <Label>Override Date</Label>
                                        <Input
                                            type="date"
                                            value={form.override_date}
                                            onChange={(e) => setForm((f) => ({ ...f, override_date: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "Create Schedule"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!selectedClassId ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Select a class to manage schedules</p>
                    </CardContent>
                </Card>
            ) : loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="py-4">
                                <div className="h-16 bg-muted rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : schedules.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-1">No schedules yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Create a schedule to set CLO times for this class.
                        </p>
                        <Button onClick={() => setDialogOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Schedule
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {schedules.map((schedule) => (
                        <Card key={schedule.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            {schedule.name}
                                            {schedule.is_override && (
                                                <Badge variant="outline" className="text-xs">Override</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-1 space-y-0.5">
                                            {schedule.clo_time && (
                                                <span className="block">CLO: {schedule.clo_time}</span>
                                            )}
                                            <span className="block">
                                                {getRepeatLabel(schedule)} · From {schedule.start_date}
                                                {schedule.end_date ? ` to ${schedule.end_date}` : ""}
                                            </span>
                                            {schedule.is_override && schedule.override_date && (
                                                <span className="block text-amber-600 dark:text-amber-400">
                                                    Override for {schedule.override_date}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                        onClick={() => handleDelete(schedule.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
