"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle, ArrowRight, LogOut } from "lucide-react"
import { DESTINATIONS } from "@/lib/constants"
import type { Class, Student } from "@/types"

type Step = "name" | "destination" | "confirm" | "done"

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
        if (!input) {
            setNameError("Please enter your name or ID")
            return
        }

        if (classData?.class_list_enabled && students.length > 0) {
            // Try to find by ID or name
            const lower = input.toLowerCase()
            const match = students.find(
                (s) =>
                    s.student_id.toLowerCase() === lower ||
                    s.name.toLowerCase() === lower ||
                    s.name.toLowerCase().includes(lower)
            )
            if (!match) {
                setNameError("Student not found. Please check your name or ID.")
                return
            }
            setResolvedName(match.name)
            setResolvedStudentId(match.student_id)
        } else {
            setResolvedName(input)
        }

        setStep("destination")
    }

    const handleDestinationSubmit = () => {
        setStep("confirm")
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
            setStep("done")
        } catch {
            toast.error("Failed to sign out. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleReset = () => {
        setStep("name")
        setNameInput("")
        setResolvedName("")
        setResolvedStudentId(undefined)
        setDestination("")
        setCustomDestination("")
        setNameError("")
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
                        <CardDescription>
                            This sign-out link is invalid. Please ask your teacher for the correct link.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-svh bg-muted p-6">
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
                                {classData.class_list_enabled
                                    ? "Enter your name or student ID"
                                    : "Enter your name"}
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
                                {nameError && (
                                    <p className="text-sm text-destructive">{nameError}</p>
                                )}
                            </div>
                            <Button onClick={handleNameSubmit} className="w-full gap-2">
                                Next
                                <ArrowRight className="h-4 w-4" />
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
                            <div className="grid grid-cols-2 gap-2">
                                {DESTINATIONS.filter((d) => d !== "Other").map((dest) => (
                                    <Button
                                        key={dest}
                                        variant={destination === dest ? "default" : "outline"}
                                        className="h-12 text-sm"
                                        onClick={() => setDestination(dest)}
                                    >
                                        {dest}
                                    </Button>
                                ))}
                                <Button
                                    variant={destination === "Other" ? "default" : "outline"}
                                    className="h-12 text-sm col-span-2"
                                    onClick={() => setDestination("Other")}
                                >
                                    Other
                                </Button>
                            </div>
                            {destination === "Other" && (
                                <Input
                                    placeholder="Where are you going?"
                                    value={customDestination}
                                    onChange={(e) => setCustomDestination(e.target.value)}
                                    autoFocus
                                />
                            )}
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("name")}>
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={handleDestinationSubmit}
                                    disabled={!destination || (destination === "Other" && !customDestination.trim())}
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
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
                            <CardDescription>Please confirm your sign-out details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium">{resolvedName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Destination</span>
                                    <span className="font-medium">
                                        {destination === "Other" ? customDestination : destination}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="font-medium">
                                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("destination")}>
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={handleConfirm}
                                    disabled={submitting}
                                >
                                    {submitting ? "Signing Out..." : "Confirm"}
                                    {!submitting && <LogOut className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step: Done */}
                {step === "done" && (
                    <Card>
                        <CardContent className="flex flex-col items-center text-center py-8 space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <div>
                                <h2 className="text-xl font-bold">You&apos;re signed out!</h2>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Have a safe trip, {resolvedName}.
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Heading to: <span className="font-medium">
                                    {destination === "Other" ? customDestination : destination}
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Time out: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
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
