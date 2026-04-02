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
import { TimePicker, type TimeValue } from "@/components/time-picker"
import { toast } from "sonner"
import { Bell, BookOpen, CalendarClock, Clock, Plus, Trash2 } from "lucide-react"
import type { BellPeriod, Schedule } from "@/types"
import { DAYS_OF_WEEK, REPEAT_TYPES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeValueToHHMM(tv: TimeValue): string {
    let h = tv.hour
    if (tv.period === "PM" && h !== 12) h += 12
    if (tv.period === "AM" && h === 12) h = 0
    return `${String(h).padStart(2, "0")}:${String(tv.minute).padStart(2, "0")}`
}

function hhmmToTimeValue(hhmm: string): TimeValue {
    const [hStr, mStr] = hhmm.split(":")
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const period = h < 12 ? "AM" : "PM"
    return { hour: h % 12 || 12, minute: m, period }
}

// ─── Bell Schedule Section ─────────────────────────────────────────────────────
function BellScheduleSection() {
    const [periods, setPeriods] = useState<BellPeriod[]>([])
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [name, setName] = useState("")
    const [startVal, setStartVal] = useState<TimeValue>({ hour: 8, minute: 0, period: "AM" })
    const [endVal, setEndVal] = useState<TimeValue>({ hour: 8, minute: 50, period: "AM" })

    const fetchPeriods = useCallback(async () => {
        setLoading(true)
        const res = await fetch("/api/bell-schedule")
        if (res.ok) setPeriods(await res.json())
        setLoading(false)
    }, [])

    useEffect(() => { fetchPeriods() }, [fetchPeriods])

    const handleAdd = async () => {
        if (!name.trim()) { toast.error("Period name is required"); return }
        setSaving(true)
        try {
            const res = await fetch("/api/bell-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    start_time: timeValueToHHMM(startVal),
                    end_time: timeValueToHHMM(endVal),
                    order_index: periods.length,
                }),
            })
            if (!res.ok) throw new Error()
            toast.success("Period added")
            setAddOpen(false)
            setName("")
            await fetchPeriods()
        } catch {
            toast.error("Failed to add period")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this period?")) return
        await fetch(`/api/bell-schedule/${id}`, { method: "DELETE" })
        toast.success("Period deleted")
        await fetchPeriods()
    }

    const fmt = (t: string) => {
        const [h, m] = t.split(":").map(Number)
        const p = h < 12 ? "AM" : "PM"
        const dh = h % 12 || 12
        return `${dh}:${String(m).padStart(2, "0")} ${p}`
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-base">Bell Schedule</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Define your class periods — used on the TV display to show the active CLO.
                            </CardDescription>
                        </div>
                    </div>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5">
                                <Plus className="h-4 w-4" /> Add Period
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Add Bell Period</DialogTitle>
                                <DialogDescription>Name this period and set its start and end times.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-1">
                                    <Label>Period Name *</Label>
                                    <Input
                                        placeholder="e.g., Period 1"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <TimePicker value={startVal} onChange={setStartVal} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <TimePicker value={endVal} onChange={setEndVal} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleAdd} disabled={saving || !name.trim()}>
                                    {saving ? "Adding…" : "Add Period"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-16 bg-muted rounded animate-pulse" />
                ) : periods.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                        <Clock className="h-8 w-8 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground">
                            No periods yet. Add your bell schedule to enable CLO display on the TV.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {periods.map((p) => (
                            <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-sm">{p.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {fmt(p.start_time)} – {fmt(p.end_time)}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(p.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchedulesPage() {
    const { classes } = useClasses()
    const [selectedClassId, setSelectedClassId] = useState<string>("")
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

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

    useEffect(() => { fetchSchedules() }, [fetchSchedules])
    useEffect(() => {
        if (!selectedClassId && classes.length > 0) setSelectedClassId(classes[0].id)
    }, [classes, selectedClassId])

    const handleSave = async () => {
        if (!selectedClassId || !form.name || !form.start_date) {
            toast.error("Please fill in all required fields"); return
        }
        setSaving(true)
        try {
            const res = await fetch("/api/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ class_id: selectedClassId, ...form }),
            })
            if (!res.ok) throw new Error()
            toast.success("CLO schedule created")
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
        if (!confirm("Delete this CLO schedule?")) return
        try {
            await fetch(`/api/schedules/${id}`, { method: "DELETE" })
            toast.success("Schedule deleted")
            await fetchSchedules()
        } catch {
            toast.error("Failed to delete")
        }
    }

    const resetForm = () => {
        setForm({
            name: "", clo_time: "", repeat_type: "none", repeat_days: [],
            start_date: new Date().toISOString().split("T")[0],
            end_date: "", is_override: false, override_date: "",
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
        if (s.repeat_type === "custom" && s.repeat_days?.length) {
            const days = s.repeat_days.map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label?.slice(0, 3)).join(", ")
            return `Custom: ${days}`
        }
        return REPEAT_TYPES.find((r) => r.value === s.repeat_type)?.label ?? s.repeat_type
    }

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Schedules &amp; CLO</h2>
                <p className="text-muted-foreground text-sm">
                    Set up your bell schedule, then assign Clear Learning Objectives per class per day.
                </p>
            </div>

            {/* Bell Schedule */}
            <BellScheduleSection />

            {/* CLO Schedules */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle className="text-base">Clear Learning Objectives (CLO)</CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Schedule CLOs per class and day. They cycle automatically when a period ends.
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger className="w-44 h-8 text-sm">
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-1.5" disabled={!selectedClassId}>
                                        <Plus className="h-4 w-4" /> Add CLO
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create CLO Schedule</DialogTitle>
                                        <DialogDescription>
                                            Assign a learning objective to specific days for this class.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                                        <div className="space-y-1">
                                            <Label>Learning Objective *</Label>
                                            <Input
                                                placeholder="e.g., Students will understand fractions"
                                                value={form.name}
                                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Active After Time (optional)</Label>
                                            <Input
                                                type="time"
                                                value={form.clo_time}
                                                onChange={(e) => setForm((f) => ({ ...f, clo_time: e.target.value }))}
                                            />
                                            <p className="text-xs text-muted-foreground">CLO becomes active at this time each day it&apos;s scheduled</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Repeat Pattern</Label>
                                            <Select
                                                value={form.repeat_type}
                                                onValueChange={(v) => setForm((f) => ({ ...f, repeat_type: v as Schedule["repeat_type"] }))}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {REPEAT_TYPES.map((rt) => (
                                                        <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
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
                                                <p className="text-xs text-muted-foreground">Apply this CLO for one specific date only</p>
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
                                            {saving ? "Saving…" : "Create CLO"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!selectedClassId ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <CalendarClock className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground text-sm">Select a class to manage CLO schedules</p>
                        </div>
                    ) : loading ? (
                        <div className="space-y-2">
                            {[1, 2].map((i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground text-sm mb-3">No CLOs scheduled for this class.</p>
                            <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
                                <Plus className="h-4 w-4" /> Add First CLO
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="flex items-start justify-between rounded-lg border px-3 py-2.5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm truncate">{schedule.name}</span>
                                            {schedule.is_override && (
                                                <Badge variant="outline" className="text-xs shrink-0">Override</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {schedule.clo_time && <span className="mr-2">Active from {schedule.clo_time}</span>}
                                            {getRepeatLabel(schedule)} · {schedule.start_date}
                                            {schedule.end_date ? ` → ${schedule.end_date}` : ""}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive shrink-0 ml-2"
                                        onClick={() => handleDelete(schedule.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
