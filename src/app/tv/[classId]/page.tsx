"use client"

import React, { useState, useEffect, useCallback, use, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import type { TvModeSettings, Class, SignOut, BellPeriod, Schedule } from "@/types"

interface TvPageProps {
    params: Promise<{ classId: string }>
}

function getActivePeriod(periods: BellPeriod[], now: Date): BellPeriod | null {
    const hh = String(now.getHours()).padStart(2, "0")
    const mm = String(now.getMinutes()).padStart(2, "0")
    const nowStr = `${hh}:${mm}:00`
    return periods.find((p) => p.start_time <= nowStr && p.end_time >= nowStr) ?? null
}

function getActiveClo(schedules: Schedule[], now: Date): Schedule | null {
    const todayStr = now.toISOString().split("T")[0]
    const dayOfWeek = now.getDay()
    const hh = String(now.getHours()).padStart(2, "0")
    const mm = String(now.getMinutes()).padStart(2, "0")
    const nowTime = `${hh}:${mm}:00`

    // Overrides take priority
    const override = schedules.find(
        (s) => s.is_override && s.override_date === todayStr &&
            (!s.clo_time || s.clo_time <= nowTime)
    )
    if (override) return override

    // Regular schedules
    return schedules.find((s) => {
        if (s.is_override) return false
        if (s.start_date > todayStr) return false
        if (s.end_date && s.end_date < todayStr) return false
        if (s.clo_time && s.clo_time > nowTime) return false
        if (s.repeat_type === "daily") return true
        if (s.repeat_type === "weekly" || s.repeat_type === "custom") {
            return s.repeat_days?.includes(dayOfWeek)
        }
        if (s.repeat_type === "none") return s.start_date === todayStr
        return false
    }) ?? null
}

export default function TvPage({ params }: TvPageProps) {
    const { classId } = use(params)

    const [classData, setClassData] = useState<Class | null>(null)
    const [settings, setSettings] = useState<TvModeSettings | null>(null)
    const [activeSignOuts, setActiveSignOuts] = useState<SignOut[]>([])
    const [bellPeriods, setBellPeriods] = useState<BellPeriod[]>([])
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [bgIndex, setBgIndex] = useState(0)
    const supabaseRef = useRef(createClient())

    const fetchData = useCallback(async () => {
        const supabase = supabaseRef.current
        const [classRes, settingsRes, signOutsRes, schedulesRes] = await Promise.all([
            supabase.from("classes").select("*").eq("id", classId).single(),
            supabase.from("tv_mode_settings").select("*").eq("class_id", classId).single(),
            supabase.from("sign_outs").select("*").eq("class_id", classId).is("time_in", null).order("time_out", { ascending: true }),
            supabase.from("schedules").select("*").eq("class_id", classId),
        ])
        const cls = classRes.data as Class
        setClassData(cls)
        setSettings(settingsRes.data as TvModeSettings)
        setActiveSignOuts((signOutsRes.data as SignOut[]) ?? [])
        setSchedules((schedulesRes.data as Schedule[]) ?? [])

        // Fetch bell periods for the teacher
        if (cls?.teacher_id) {
            const periodsRes = await supabase
                .from("bell_schedule_periods")
                .select("*")
                .eq("teacher_id", cls.teacher_id)
                .order("order_index", { ascending: true })
            setBellPeriods((periodsRes.data as BellPeriod[]) ?? [])
        }

        setLoading(false)
    }, [classId])

    useEffect(() => {
        fetchData()
        const supabase = supabaseRef.current
        const channel = supabase
            .channel(`tv_signouts:${classId}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "sign_outs", filter: `class_id=eq.${classId}` }, () => fetchData())
            .subscribe()

        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(clockInterval)
        }
    }, [classId, fetchData])

    // Background cycling
    useEffect(() => {
        if (!settings?.cycle_background) return
        const images = settings.background_images ?? []
        if (images.length <= 1) return
        const iv = setInterval(() => setBgIndex((i) => (i + 1) % images.length), 30_000)
        return () => clearInterval(iv)
    }, [settings])

    const activePeriod = getActivePeriod(bellPeriods, currentTime)
    const activeClo = getActiveClo(schedules, currentTime)
    const fontFamily = settings?.font_family ?? "inherit"
    const textColor = settings?.text_color ?? "#FFFFFF"

    const bgImages = settings?.background_images ?? []
    const bgImage = settings?.cycle_background
        ? bgImages[bgIndex % Math.max(bgImages.length, 1)]
        : settings?.selected_background

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-svh bg-[#0d1527] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
        )
    }

    if (!classData || !classData.tv_mode_enabled) {
        return (
            <div className="flex flex-col items-center justify-center min-h-svh bg-[#0d1527] text-white text-center p-8">
                <h1 className="text-2xl font-bold mb-2">TV Mode Not Enabled</h1>
                <p className="text-gray-400">This class does not have TV mode enabled.</p>
            </div>
        )
    }

    return (
        <div
            className="min-h-svh flex flex-col"
            style={{
                backgroundColor: "#0d1527",
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                fontFamily,
                color: textColor,
            }}
        >
            {/* Overlay */}
            <div className="min-h-svh flex flex-col" style={{ backgroundColor: "rgba(10,18,40,0.72)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: textColor }}>{classData.name}</h1>
                        {activePeriod && (
                            <p className="text-sm mt-0.5" style={{ color: textColor, opacity: 0.7 }}>
                                {activePeriod.name}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold tabular-nums" style={{ color: textColor }}>
                            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-sm mt-0.5" style={{ color: textColor, opacity: 0.7 }}>
                            {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* CLO — front and center */}
                {activeClo && (
                    <div className="flex flex-col items-center justify-center px-8 py-6">
                        <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: textColor, opacity: 0.6 }}>
                            Clear Learning Objective
                        </p>
                        <h2
                            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center max-w-4xl leading-tight"
                            style={{ color: textColor }}
                        >
                            {activeClo.name}
                        </h2>
                    </div>
                )}

                {/* Divider */}
                <div className="px-8">
                    <div className="h-px w-full" style={{ backgroundColor: textColor, opacity: 0.2 }} />
                </div>

                {/* Students out */}
                <div className="flex-1 px-8 py-6">
                    {settings?.show_students && (
                        <>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-px flex-1" style={{ backgroundColor: textColor, opacity: 0.2 }} />
                                <span className="text-sm font-medium uppercase tracking-widest" style={{ color: textColor, opacity: 0.6 }}>
                                    {activeSignOuts.length === 0
                                        ? "All students are in class"
                                        : `${activeSignOuts.length} student${activeSignOuts.length !== 1 ? "s" : ""} out`}
                                </span>
                                <div className="h-px flex-1" style={{ backgroundColor: textColor, opacity: 0.2 }} />
                            </div>

                            {activeSignOuts.length > 0 && (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {activeSignOuts.map((signOut) => (
                                        <div
                                            key={signOut.id}
                                            className="rounded-xl p-4"
                                            style={{
                                                backgroundColor: "rgba(255,255,255,0.08)",
                                                backdropFilter: "blur(10px)",
                                                border: "1px solid rgba(255,255,255,0.15)",
                                            }}
                                        >
                                            <p className="text-lg font-semibold truncate" style={{ color: textColor }}>
                                                {signOut.student_name}
                                            </p>
                                            {signOut.destination && (
                                                <p className="text-sm mt-0.5" style={{ color: textColor, opacity: 0.75 }}>
                                                    → {signOut.destination}
                                                </p>
                                            )}
                                            {settings?.show_time_out && (
                                                <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.55 }}>
                                                    Out {formatDistanceToNow(new Date(signOut.time_out), { addSuffix: true })}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

