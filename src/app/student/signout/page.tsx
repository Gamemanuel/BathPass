"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle, ArrowRight, LogOut, Clock, MapPin } from "lucide-react"
import { DESTINATIONS } from "@/lib/constants"
import type { Class, Student } from "@/types"

type Step = "name" | "destination" | "confirm" | "waiting" | "back"

function useElapsedTimer(startTime: Date | null) {
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => {
        if (!startTime) return
        const iv = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
        }, 1000)
        return () => clearInterval(iv)
    }, [startTime])
    const mins = Math.floor(elapsed / 60)
    const secs = elapsed % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

function SignOutForm() {
    const searchParams = useSearchParams()
    const classId = searchParams.get("classId")

    const [step, setStep] = useState<Step>("name")
    const [classData, setClassData] = useState<Class | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [nameInput, setNameInput] = useState("")
    const [resolvedName, setResolvedName] = useState("")
    const [resolvedStudentId, setResolvedStudentId] = useState<string | undefined>()
    const [destination, setDestination] = useState("")
    const [customDestination, setCustomDestination] = useState("")
    const [nameError, setNameError] = useState("")

    const [signOutId, setSignOutId] = useState<string | null>(null)
    const [signOutTime, setSignOutTime] = useState<Date | null>(null)
    const elapsed = useElapsedTimer(signOutTime)

    // Destinations: class-specific if set, otherwise defaults
    const destinations = classData?.destinations && classData.destinations.length > 0
        ? classData.destinations
        : Array.from(DESTINATIONS)

    useEffect(() => {
        if (!classId) { setLoading(false); return }

        const supabase = createClient()
        Promise.all([
            supabase.from("classes").select("*").eq("id", classId).single(),
            supabase.from("students").select("*").eq("class_id", classId).order("name"),
        ]).then(([classRes, studentsRes]) => {
            setClassData(classRes.data as Class)
            setStudents((studentsRes.data as Student[]) ?? [])
            setLoading(false)
        })
    }, [classId])

    const handleNameSubmit = () => {
        setNameError("")
        const input = nameInput.trim()
        if (!input) { setNameError("Please enter your name or ID"); return }

        if (classData?.class_list_enabled && students.length > 0) {
            const lower = input.toLowerCase()
            const match = students.find(
                (s) =>
                    s.student_id.toLowerCase() === lower ||
                    s.name.toLowerCase() === lower ||
                    s.name.toLowerCase().includes(lower)
            )
            if (!match) { setNameError("Student not found. Please check your name or ID."); return }
            setResolvedName(match.name)
            setResolvedStudentId(match.student_id)
        } else {
            setResolvedName(input)
        }
        setStep("destination")
    }

    const handleConfirm = async () => {
        if (!classId) return
        setSubmitting(true)
        try {
            const finalDestination = destination === "Other" ? customDestination : destination
            const res = await fetch("/api/signouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    class_id: classId,
                    student_name: resolvedName,
                    student_id: resolvedStudentId,
                    destination: finalDestination || undefined,
                }),
            })
            if (!res.ok) throw new Error("Failed to sign out")
            const data = await res.json()
            setSignOutId(data.id)
            setSignOutTime(new Date())
            setStep("waiting")
        } catch {
            toast.error("Failed to sign out. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleImBack = async () => {
        if (!signOutId) return
        setSubmitting(true)
        try {
            const res = await fetch(`/api/signouts/${signOutId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return: true }),
            })
            if (!res.ok) throw new Error()
            setStep("back")
        } catch {
            toast.error("Failed to sign back in. Ask your teacher.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleReset = () => {
        setStep("name"); setNameInput(""); setResolvedName(""); setResolvedStudentId(undefined)
        setDestination(""); setCustomDestination(""); setNameError(""); setSignOutId(null); setSignOutTime(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-svh">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (!classId || !classData) {
        return (
            <div className="flex items-center justify-center min-h-svh p-6">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle>No Class Found</CardTitle>
                        <CardDescription>This sign-out link is invalid. Ask your teacher for the correct link.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const finalDestinationLabel = destination === "Other" ? customDestination : destination

    return (
        <div className="flex items-center justify-center min-h-svh p-6">
            <div className="w-full max-w-sm space-y-4">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <LogOut className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Sign Out</h1>
                    <p className="text-muted-foreground text-sm">{classData.name}</p>
                </div>

                {/* Step: Name */}
                {step === "name" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Who are you?</CardTitle>
                            <CardDescription>
                                {classData.class_list_enabled ? "Enter your name or student ID" : "Enter your name"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name-input">
                                    {classData.class_list_enabled ? "Name or ID" : "Your Name"}
                                </Label>
                                <Input
                                    id="name-input"
                                    placeholder={classData.class_list_enabled ? "e.g., John or 1234" : "e.g., John Smith"}
                                    value={nameInput}
                                    onChange={(e) => { setNameInput(e.target.value); setNameError("") }}
                                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                                    autoFocus
                                />
                                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                            </div>
                            <Button onClick={handleNameSubmit} className="w-full gap-2">
                                Next <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step: Destination */}
                {step === "destination" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Where are you going?</CardTitle>
                            <CardDescription>Hi, {resolvedName}! Select your destination.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select
                                value={destination}
                                onValueChange={setDestination}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select destination…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {destinations.filter((d) => d !== "Other").map((dest) => (
                                        <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                                    ))}
                                    <SelectItem value="Other">Other…</SelectItem>
                                </SelectContent>
                            </Select>
                            {destination === "Other" && (
                                <Input
                                    placeholder="Where are you going?"
                                    value={customDestination}
                                    onChange={(e) => setCustomDestination(e.target.value)}
                                    autoFocus
                                />
                            )}
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("name")}>Back</Button>
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={() => setStep("confirm")}
                                    disabled={!destination || (destination === "Other" && !customDestination.trim())}
                                >
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step: Confirm */}
                {step === "confirm" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Confirm Sign-Out</CardTitle>
                            <CardDescription>Please confirm your details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium">{resolvedName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Destination</span>
                                    <span className="font-medium">{finalDestinationLabel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="font-medium">
                                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("destination")}>Back</Button>
                                <Button className="flex-1 gap-2" onClick={handleConfirm} disabled={submitting}>
                                    {submitting ? "Signing Out…" : <>Confirm <LogOut className="h-4 w-4" /></>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step: Waiting */}
                {step === "waiting" && (
                    <Card>
                        <CardContent className="flex flex-col items-center text-center py-8 space-y-6">
                            <div className="rounded-full bg-primary/10 p-5">
                                <Clock className="h-12 w-12 text-primary" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mb-1">
                                    Time Away
                                </p>
                                <p className="text-5xl font-bold tabular-nums text-primary">{elapsed}</p>
                            </div>
                            <div className="w-full rounded-lg bg-muted p-3 text-sm space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Student</span>
                                    <span className="font-medium">{resolvedName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Heading to
                                    </span>
                                    <span className="font-medium">{finalDestinationLabel}</span>
                                </div>
                            </div>
                            <Button
                                className="w-full gap-2"
                                size="lg"
                                onClick={handleImBack}
                                disabled={submitting}
                            >
                                <CheckCircle className="h-5 w-5" />
                                {submitting ? "Checking in…" : "I'm Back!"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step: Back */}
                {step === "back" && (
                    <Card>
                        <CardContent className="flex flex-col items-center text-center py-8 space-y-4">
                            <CheckCircle className="h-16 w-16 text-primary" />
                            <div>
                                <h2 className="text-xl font-bold">Welcome back, {resolvedName}!</h2>
                                <p className="text-muted-foreground text-sm mt-1">
                                    You were away for {elapsed}.
                                </p>
                            </div>
                            <Button onClick={handleReset} variant="outline" className="w-full mt-2">
                                Sign Out Another Student
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default function SignOutPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-svh">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <SignOutForm />
        </Suspense>
    )
}
