import { ArrowDownRight, ArrowUpRight, Clock, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card, CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface MetricCardProps {
    title: string;
    value: string;
    description: string;
    change: string;
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, change, icon }) => {
    const isPositive = change.startsWith('+');
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
            <CardFooter>
                <div className="flex items-center text-xs">
                    <Badge variant="outline" className={`h-6 ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {change}
                    </Badge>
                </div>
            </CardFooter>
        </Card>
    )
}

export function SectionCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Students Currently Out"
                value="8"
                description="Active passes on the board"
                change="+2 since last hour"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
                title="Total Passes Today"
                value="45"
                description="Passes completed"
                change="+12% from yesterday"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
                title="Average Pass Time"
                value="7.2 min"
                description="Goal is < 10 minutes"
                change="-0.5 min from last week"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
                title="Longest Pass Out"
                value="23 min"
                description="Needs follow-up"
                change="+5 min from longest pass"
                icon={<ArrowDownRight className="h-4 w-4 text-red-500" />}
            />
        </div>
    )
}