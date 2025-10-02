// components/tv-mode-schedule.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react";

export function TvModeSchedule() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Schedule & Class Editor
                </CardTitle>
                <CardDescription>
                    Set up the display schedule for classes and breaks.
                </CardDescription>
            </CardHeader>
            <CardContent className="py-6 text-muted-foreground">
                Schedule logic goes here (Class Hours, Repeating/Override Schedule).
            </CardContent>
        </Card>
    )
}