"use client"

import React, { useState, useEffect, useCallback, use, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import type { TvModeSettings, Class, SignOut } from "@/types"

interface TvPageProps {
    params: Promise<{ classId: string }>
}

export default function TvPage({ params }: TvPageProps) {
    const { classId } = use(params)

    const [classData, setClassData] = useState<Class | null>(null)
    const [settings, setSettings] = useState<TvModeSettings | null>(null)
    const [activeSignOuts, setActiveSignOuts] = useState<SignOut[]>([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const supabaseRef = useRef(createClient())

    const fetchData = useCallback(async () => {
        const supabase = supabaseRef.current
        const [classRes, settingsRes, signOutsRes] = await Promise.all([
            supabase.from("classes").select("*").eq("id", classId).single(),
            supabase.from("tv_mode_settings").select("*").eq("class_id", classId).single(),
            supabase
                .from("sign_outs")
                .select("*")
                .eq("class_id", classId)
                .is("time_in", null)
                .order("time_out", { ascending: true }),
        ])

        setClassData(classRes.data as Class)
        setSettings(settingsRes.data as TvModeSettings)
        setActiveSignOuts((signOutsRes.data as SignOut[]) ?? [])
        setLoading(false)
    }, [classId])

    useEffect(() => {
        fetchData()

        const supabase = supabaseRef.current
        // Real-time subscription for sign-outs
        const channel = supabase
            .channel(`tv_signouts:${classId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "sign_outs", filter: `class_id=eq.${classId}` },
                () => fetchData()
            )
            .subscribe()

        // Clock tick
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(clockInterval)
        }
    }, [classId, fetchData])

    const fontFamily = settings?.font_family ?? "Inter"
    const textColor = settings?.text_color ?? "#FFFFFF"

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-svh bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
        )
    }

    if (!classData || !classData.tv_mode_enabled) {
        return (
            <div className="flex flex-col items-center justify-center min-h-svh bg-black text-white text-center p-8">
                <h1 className="text-2xl font-bold mb-2">TV Mode Not Enabled</h1>
                <p className="text-gray-400">This class does not have TV mode enabled.</p>
            </div>
        )
    }

    return (
        <div
            className="min-h-svh flex flex-col"
            style={{
                backgroundColor: "#1a1a2e",
                backgroundImage: settings?.selected_background
                    ? `url(${settings.selected_background})`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                fontFamily: fontFamily,
                color: textColor,
            }}
        >
            {/* Background overlay for readability */}
            <div className="min-h-svh flex flex-col" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ fontFamily, color: textColor }}>
                            {classData.name}
                        </h1>
                        <p className="text-sm opacity-70" style={{ color: textColor }}>
                            Bath Pass — TV Display
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold tabular-nums" style={{ fontFamily, color: textColor }}>
                            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-sm opacity-70" style={{ color: textColor }}>
                            {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 px-8 pb-8">
                    {settings?.show_students && (
                        <>
                            <div className="mb-4 flex items-center gap-3">
                                <div
                                    className="h-px flex-1 opacity-30"
                                    style={{ backgroundColor: textColor }}
                                />
                                <span
                                    className="text-sm font-medium uppercase tracking-widest opacity-70"
                                    style={{ color: textColor }}
                                >
                                    {activeSignOuts.length === 0
                                        ? "No students out"
                                        : `${activeSignOuts.length} student${activeSignOuts.length !== 1 ? "s" : ""} out`}
                                </span>
                                <div
                                    className="h-px flex-1 opacity-30"
                                    style={{ backgroundColor: textColor }}
                                />
                            </div>

                            {activeSignOuts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 opacity-60">
                                    <p className="text-xl" style={{ fontFamily, color: textColor }}>
                                        All students are in class ✓
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {activeSignOuts.map((signOut) => (
                                        <div
                                            key={signOut.id}
                                            className="rounded-xl p-4"
                                            style={{
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                                backdropFilter: "blur(10px)",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                            }}
                                        >
                                            <p
                                                className="text-lg font-semibold truncate"
                                                style={{ fontFamily, color: textColor }}
                                            >
                                                {signOut.student_name}
                                            </p>
                                            {signOut.destination && (
                                                <p
                                                    className="text-sm opacity-80 mt-0.5"
                                                    style={{ fontFamily, color: textColor }}
                                                >
                                                    → {signOut.destination}
                                                </p>
                                            )}
                                            {settings?.show_time_out && (
                                                <p
                                                    className="text-xs opacity-60 mt-1"
                                                    style={{ color: textColor }}
                                                >
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
