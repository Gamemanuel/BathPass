"use client"

import React, { useState, useEffect } from "react"
import { useClasses } from "@/hooks/useClasses"
import { useActiveSignOuts } from "@/hooks/useSignOuts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle, Clock, MapPin, Trash2, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function LinePage() {
    const { classes, loading: classesLoading } = useClasses()
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
    const { activeSignOuts, loading, markReturned, removeFromLine } = useActiveSignOuts(selectedClassId)

    // Auto-select first class
    useEffect(() => {
        if (!selectedClassId && classes.length > 0) {
            setSelectedClassId(classes[0].id)
        }
    }, [classes, selectedClassId])

    const handleMarkReturned = async (id: string, name: string) => {
        try {
            await markReturned(id)
            toast.success(`${name} marked as returned`)
        } catch {
            toast.error("Failed to mark as returned")
        }
    }

    const handleRemove = async (id: string, name: string) => {
        try {
            await removeFromLine(id)
            toast.success(`${name} removed from line`)
        } catch {
            toast.error("Failed to remove from line")
        }
    }

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Line</h2>
                    <p className="text-muted-foreground">
                        Students currently out of class — real-time updates.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedClassId ?? ""}
                        onValueChange={setSelectedClassId}
                        disabled={classesLoading || classes.length === 0}
                    >
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
                </div>
            </div>

            {!selectedClassId ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Select a class to view the line</p>
                    </CardContent>
                </Card>
            ) : loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="py-4">
                                <div className="h-8 bg-muted rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : activeSignOuts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="font-semibold text-lg mb-1">All students are in class</h3>
                        <p className="text-muted-foreground text-sm">
                            No students are currently out of class.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{activeSignOuts.length} student{activeSignOuts.length !== 1 ? "s" : ""} out</span>
                    </div>
                    {activeSignOuts.map((signOut) => (
                        <Card key={signOut.id}>
                            <CardHeader className="pb-2 pt-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate">
                                            {signOut.student_name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-3 flex-wrap mt-1">
                                            {signOut.destination && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {signOut.destination}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(signOut.time_out), { addSuffix: true })}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        {new Date(signOut.time_out).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="gap-1 flex-1"
                                        onClick={() => handleMarkReturned(signOut.id, signOut.student_name)}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Back in Class
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 text-destructive hover:text-destructive"
                                        onClick={() => handleRemove(signOut.id, signOut.student_name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
