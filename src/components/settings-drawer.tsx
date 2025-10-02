// components/settings-drawer.tsx
"use client"

import * as React from "react"
import { Settings, MonitorCheck, User } from "lucide-react"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TvModeSettings } from "./tv-mode-settings"
import { ScrollArea } from "@/components/ui/scroll-area"

export function SettingsDrawer({ teacherId }: { teacherId: string }) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[90%] sm:h-[650px] max-w-4xl mx-auto">
                <DrawerHeader>
                    <DrawerTitle className="text-2xl">Application Settings</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-1 overflow-hidden">
                    <Tabs defaultValue="tvmode" className="flex w-full">
                        {/* Sidebar-style Navigation */}
                        <div className="flex-shrink-0 w-48 border-r p-4">
                            <TabsList className="flex flex-col h-auto p-1 gap-1">
                                <TabsTrigger value="tvmode" className="w-full justify-start data-[state=active]:bg-accent">
                                    <MonitorCheck className="mr-2 h-4 w-4" /> TV Mode
                                </TabsTrigger>
                                <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-accent">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <ScrollArea className="flex-1 p-6">
                            <TabsContent value="tvmode">
                                <h2 className="text-xl font-semibold mb-4">TV Mode Configuration</h2>
                                <TvModeSettings teacherId={teacherId} />
                            </TabsContent>
                            <TabsContent value="profile">
                                <h2 className="text-xl font-semibold mb-4">User Profile</h2>
                                <p className="text-muted-foreground">
                                    Your profile settings will go here.
                                    <br />
                                    Current Teacher ID: **{teacherId}**
                                </p>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    )
}