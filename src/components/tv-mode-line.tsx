// components/tv-mode-line.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react";

export function TvModeLine() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> Real-time Pass Line Management
                </CardTitle>
                <CardDescription>
                    View and manage the queue of students currently out on a pass.
                </CardDescription>
            </CardHeader>
            <CardContent className="py-6 text-muted-foreground">
                Line queue management logic goes here (Add, Remove, View Queue).
            </CardContent>
        </Card>
    )
}
