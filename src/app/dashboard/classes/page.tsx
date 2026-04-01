"use client"

import React, { useRef, useState } from "react"
import { useClasses } from "@/hooks/useClasses"
import { useStudents } from "@/hooks/useStudents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Backpack, Plus, Trash2, Upload, Users, Tv, ClipboardList } from "lucide-react"
import Papa from "papaparse"
import type { Class, StudentCSVRow } from "@/types"
import Link from "next/link"

function ClassCard({ cls, onDelete, onUpdate }: {
    cls: Class
    onDelete: (id: string) => void
    onUpdate: (id: string, updates: Partial<Class>) => void
}) {
    const { students, loading: studentsLoading, uploadStudents } = useStudents(cls.id)
    const fileRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            await new Promise<void>((resolve, reject) => {
                Papa.parse<StudentCSVRow>(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        const rows = results.data
                        if (!rows[0]?.ID || !rows[0]?.Name) {
                            reject(new Error("CSV must have ID and Name columns"))
                            return
                        }
                        try {
                            const res = await uploadStudents(rows)
                            toast.success(`Uploaded ${res.inserted} students`)
                            resolve()
                        } catch (err) {
                            reject(err)
                        }
                    },
                    error: reject,
                })
            })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to upload CSV")
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Backpack className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">{cls.name}</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                            if (confirm(`Delete class "${cls.name}"? This cannot be undone.`)) {
                                onDelete(cls.id)
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                {cls.description && (
                    <CardDescription>{cls.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Toggle settings */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tv className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm">TV Mode</Label>
                        </div>
                        <Switch
                            checked={cls.tv_mode_enabled}
                            onCheckedChange={(checked) => onUpdate(cls.id, { tv_mode_enabled: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm">Line Mode</Label>
                        </div>
                        <Switch
                            checked={cls.line_mode_enabled}
                            onCheckedChange={(checked) => onUpdate(cls.id, { line_mode_enabled: checked })}
                        />
                    </div>
                </div>

                {/* Class list / CSV upload */}
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {studentsLoading ? "Loading..." : `${students.length} students`}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleCSVUpload}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                disabled={uploading}
                                onClick={() => fileRef.current?.click()}
                            >
                                <Upload className="h-3 w-3" />
                                {uploading ? "Uploading..." : "Upload CSV"}
                            </Button>
                        </div>
                    </div>
                    {cls.class_list_enabled && (
                        <p className="text-xs text-muted-foreground">
                            Class list enabled — students can sign out by ID
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                        CSV format: <code>ID,Name</code> (one student per row)
                    </p>
                </div>

                {/* TV mode link */}
                {cls.tv_mode_enabled && (
                    <div className="border-t pt-3">
                        <Link href={`/tv/${cls.id}`} target="_blank">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                                <Tv className="h-3 w-3" />
                                Open TV View
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Sign-out link */}
                <div>
                    <Link href={`/student/signout?classId=${cls.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                            <ClipboardList className="h-3 w-3" />
                            Student Sign-Out Link
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ClassesPage() {
    const { classes, loading, error, createClass, updateClass, deleteClass } = useClasses()
    const [newClassName, setNewClassName] = useState("")
    const [newClassDesc, setNewClassDesc] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    const handleCreate = async () => {
        if (!newClassName.trim()) return
        setCreating(true)
        try {
            await createClass(newClassName.trim(), newClassDesc.trim() || undefined)
            toast.success(`Class "${newClassName}" created`)
            setNewClassName("")
            setNewClassDesc("")
            setDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create class")
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteClass(id)
            toast.success("Class deleted")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete class")
        }
    }

    const handleUpdate = async (id: string, updates: Partial<Class>) => {
        try {
            await updateClass(id, updates)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update class")
        }
    }

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
                    <p className="text-muted-foreground">
                        Manage your classes, upload student lists, and configure settings.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>
                                Add a new class to manage student sign-outs.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="class-name">Class Name *</Label>
                                <Input
                                    id="class-name"
                                    placeholder="e.g., Period 3 Math"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="class-desc">Description (optional)</Label>
                                <Input
                                    id="class-desc"
                                    placeholder="e.g., Room 204"
                                    value={newClassDesc}
                                    onChange={(e) => setNewClassDesc(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={!newClassName.trim() || creating}>
                                {creating ? "Creating..." : "Create Class"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {error ? (
                <Card className="border-destructive">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-destructive/10 p-3 mb-4">
                            <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Database not set up</h3>
                        <p className="text-muted-foreground text-sm mb-2 max-w-md">
                            {error}
                        </p>
                        {error.toLowerCase().includes("relation") || error.toLowerCase().includes("does not exist") ? (
                            <p className="text-sm text-muted-foreground max-w-md">
                                Run the SQL migration in <code className="bg-muted px-1 rounded">supabase/migrations/001_initial_schema.sql</code> in your Supabase SQL editor to create the required tables.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            ) : loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-20 bg-muted rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : classes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Backpack className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-1">No classes yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Create your first class to get started.
                        </p>
                        <Button onClick={() => setDialogOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Class
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            cls={cls}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
