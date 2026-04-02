import { createClient } from "@/lib/supabase/server"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Backpack, ClipboardClock, History, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Page() {
    const supabase = await createClient()

    // Fetch classes count
    const { data: classes } = await supabase
        .from("classes")
        .select("id, name, tv_mode_enabled, line_mode_enabled")
        .order("created_at", { ascending: false })

    // Fetch active sign-outs count
    const { count: activeCount } = await supabase
        .from("sign_outs")
        .select("id", { count: "exact" })
        .is("time_in", null)

    // Fetch today's sign-outs count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayCount } = await supabase
        .from("sign_outs")
        .select("id", { count: "exact" })
        .gte("time_out", today.toISOString())

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back! Here&apos;s an overview of your classes.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <Backpack className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classes?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Managed classes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Currently Out</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Students out of class</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Passes</CardTitle>
                        <ClipboardClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Sign-outs today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TV Mode Active</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classes?.filter((c) => c.tv_mode_enabled).length ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Classes with TV mode on</p>
                    </CardContent>
                </Card>
            </div>

            {/* Classes Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Classes</CardTitle>
                        <CardDescription>Quick access to your classes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {classes && classes.length > 0 ? (
                            <>
                                {classes.slice(0, 5).map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Backpack className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">{cls.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {cls.tv_mode_enabled && (
                                                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                                    TV
                                                </span>
                                            )}
                                            {cls.line_mode_enabled && (
                                                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                                                    Line
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <Link href="/dashboard/classes">
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        Manage Classes
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground text-sm mb-3">No classes yet</p>
                                <Link href="/dashboard/classes">
                                    <Button size="sm">Create your first class</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/dashboard/classes" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Backpack className="h-4 w-4" />
                                Manage Classes
                            </Button>
                        </Link>
                        <Link href="/dashboard/line" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <ClipboardClock className="h-4 w-4" />
                                View Line
                            </Button>
                        </Link>
                        <Link href="/dashboard/history" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <History className="h-4 w-4" />
                                View History
                            </Button>
                        </Link>
                        <Link href="/dashboard/schedules" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <ClipboardClock className="h-4 w-4" />
                                Manage Schedules
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
