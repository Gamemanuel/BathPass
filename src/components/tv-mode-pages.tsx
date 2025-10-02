// components/tv-mode-pages.tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TvModePages() {
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">TV Mode Display Settings</h2>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview Board</TabsTrigger>
                    <TabsTrigger value="detail">Detailed Passes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>School-wide Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-lg font-semibold">Current Status:</p>
                            <p className="text-muted-foreground">This view shows the number of students currently out, the average time, and alerts. It's designed for quick glances by admin staff.</p>
                            <div className="h-64 border rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                [Visual component for real-time metrics goes here]
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="detail" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Pass Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-lg font-semibold">Active Passes List:</p>
                            <p className="text-muted-foreground">This view cycles through the list of currently unreturned passes, showing student name, destination, and elapsed time. It is used in hallways or common areas.</p>
                            <div className="h-64 border rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                [Visual component for detailed list goes here]
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}