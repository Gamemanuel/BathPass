"use client"

import React, { useState, useEffect } from "react"
import { useClasses } from "@/hooks/useClasses"
import { useTvModeSettings } from "@/hooks/useClasses"
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
import { toast } from "sonner"
import { Tv, ExternalLink } from "lucide-react"
import { GOOGLE_FONTS } from "@/lib/constants"
import Link from "next/link"

function TvSettingsPanel({ classId }: { classId: string }) {
    const { settings, loading, updateSettings } = useTvModeSettings(classId)
    const [fontFamily, setFontFamily] = useState("Inter")
    const [textColor, setTextColor] = useState("#FFFFFF")
    const [cycleBackground, setCycleBackground] = useState(true)
    const [showTimeOut, setShowTimeOut] = useState(true)
    const [showStudents, setShowStudents] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (settings) {
            setFontFamily(settings.font_family ?? "Inter")
            setTextColor(settings.text_color ?? "#FFFFFF")
            setCycleBackground(settings.cycle_background ?? true)
            setShowTimeOut(settings.show_time_out ?? true)
            setShowStudents(settings.show_students ?? true)
        }
    }, [settings])

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateSettings({
                font_family: fontFamily,
                text_color: textColor,
                cycle_background: cycleBackground,
                show_time_out: showTimeOut,
                show_students: showStudents,
            })
            toast.success("TV settings saved")
        } catch {
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="h-32 bg-muted rounded animate-pulse" />
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {GOOGLE_FONTS.map((font) => (
                                <SelectItem key={font} value={font}>
                                    {font}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-14 h-9 p-1 cursor-pointer"
                        />
                        <Input
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            placeholder="#FFFFFF"
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <Label className="text-sm font-medium">Cycle Backgrounds</Label>
                        <p className="text-xs text-muted-foreground">Randomly cycle through background images</p>
                    </div>
                    <Switch checked={cycleBackground} onCheckedChange={setCycleBackground} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <Label className="text-sm font-medium">Show Time Out</Label>
                        <p className="text-xs text-muted-foreground">Display how long students have been out</p>
                    </div>
                    <Switch checked={showTimeOut} onCheckedChange={setShowTimeOut} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <Label className="text-sm font-medium">Show Students</Label>
                        <p className="text-xs text-muted-foreground">Display students currently out of class</p>
                    </div>
                    <Switch checked={showStudents} onCheckedChange={setShowStudents} />
                </div>
            </div>

            {/* Preview */}
            <div
                className="rounded-lg h-32 flex items-center justify-center text-center border"
                style={{
                    backgroundColor: "#1a1a2e",
                    color: textColor,
                    fontFamily: fontFamily,
                }}
            >
                <div>
                    <p className="text-xl font-bold" style={{ fontFamily }}>TV Mode Preview</p>
                    <p className="text-sm opacity-75" style={{ fontFamily }}>Sample text in {fontFamily}</p>
                </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Settings"}
            </Button>
        </div>
    )
}

export default function TvSettingsPage() {
    const { classes } = useClasses()
    const [selectedClassId, setSelectedClassId] = useState<string>("")

    useEffect(() => {
        if (!selectedClassId && classes.length > 0) {
            setSelectedClassId(classes[0].id)
        }
    }, [classes, selectedClassId])

    const selectedClass = classes.find((c) => c.id === selectedClassId)

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">TV Settings</h2>
                    <p className="text-muted-foreground">
                        Customize the TV mode display for each class.
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
                    {selectedClassId && (
                        <Link href={`/tv/${selectedClassId}`} target="_blank">
                            <Button variant="outline" size="icon">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {!selectedClassId ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Tv className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Select a class to configure TV mode</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Settings</CardTitle>
                            <CardDescription>
                                Customize fonts, colors, and what to show on the TV display
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TvSettingsPanel classId={selectedClassId} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>TV Mode Status</CardTitle>
                            <CardDescription>Enable TV mode for {selectedClass?.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium text-sm">TV Mode Enabled</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedClass?.tv_mode_enabled
                                            ? "Students can be seen on the TV display"
                                            : "TV mode is currently disabled for this class"}
                                    </p>
                                </div>
                                <div className="flex h-6 w-6 items-center justify-center rounded-full">
                                    <div className={`h-3 w-3 rounded-full ${selectedClass?.tv_mode_enabled ? "bg-green-500" : "bg-gray-300"}`} />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Toggle TV mode in the{" "}
                                <Link href="/dashboard/classes" className="underline">
                                    Classes
                                </Link>{" "}
                                settings.
                            </p>
                            {selectedClass?.tv_mode_enabled && (
                                <Link href={`/tv/${selectedClassId}`} target="_blank">
                                    <Button className="w-full gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        Open TV View
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
