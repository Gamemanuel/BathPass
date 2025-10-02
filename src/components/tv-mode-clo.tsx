// components/tv-mode-clo.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TextCursorInput } from "lucide-react";

export function TvModeCLO() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TextCursorInput className="h-5 w-5" /> Current Learning Objective (CLO)
                </CardTitle>
                <CardDescription>
                    Manage the text overlay displayed on the TV.
                </CardDescription>
            </CardHeader>
            <CardContent className="py-6 text-muted-foreground">
                CLO editing and assignment logic goes here (Real-time CLO, Out-of-Class CLO).
            </CardContent>
        </Card>
    )
}