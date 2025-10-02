// src/app/dashboard/dashboard-client.tsx

"use client"

import * as React from "react"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, Pass } from "@/components/data-table"
import { QueueTable } from "@/components/QueueTable";
import { Button } from "@/components/ui/button"
import { IconReload, IconUser } from "@tabler/icons-react"
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// --- INTERFACES ---
interface User {
    id: string;
    email: string;
    name: string;
}

interface DashboardProps {
    initialPasses: Pass[];
    user: User;
}

// Define interface for queue items (must match DB structure)
interface QueueItem {
    id: string;
    student_name: string;
    destination: string;
    position: number;
    time_joined: string;
}

// --- CORE DATA FETCHING ---

export const DashboardClient = ({ initialPasses, user }: DashboardProps) => {
    const supabase = createClient();
    const [passes, setPasses] = React.useState<Pass[]>(initialPasses);
    const [isLoading, setIsLoading] = React.useState(false);
    const [queue, setQueue] = React.useState<QueueItem[]>([]);

    // Function to fetch queue data
    const fetchQueueData = async (userId: string) => {
        const { data, error } = await supabase
            .from('queue')
            .select('id, student_name, destination, position, time_joined')
            .eq('teacher_id', userId)
            .order('position', { ascending: true });

        if (error) {
            console.error("Error fetching queue:", error);
            return [];
        }
        return (data as QueueItem[]) || [];
    };

    // Combined function to fetch all dashboard data
    const fetchData = React.useCallback(async () => {
        setIsLoading(true);

        // --- 1. Fetch Passes Data ---
        const { data: passData, error: passError } = await supabase
            .from('passes')
            .select('id, student_name, destination, time_out, time_in')
            .eq('teacher_id', user.id);

        if (passError) {
            console.error("Error fetching passes:", passError);
            toast.error("Failed to load pass data.");
        }

        const fetchedPasses: Pass[] = (passData || []).map(item => ({
            id: item.id,
            name: item.student_name,
            destination: item.destination,
            timeOut: item.time_out,
            timeIn: item.time_in,
        }));
        setPasses(fetchedPasses);

        // --- 2. Fetch Queue/Line Data ---
        const fetchedQueue = await fetchQueueData(user.id);
        setQueue(fetchedQueue);

        setIsLoading(false);
    }, [supabase, user.id]);

    // Initial Data Load (Runs once on mount)
    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- REAL-TIME SUBSCRIPTION EFFECT (NEW) ---
    React.useEffect(() => {
        const userId = user.id;

        // 1. Subscribe to 'passes' table changes
        const passesChannel = supabase
            .channel(`passes-for-teacher-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'passes',
                    filter: `teacher_id=eq.${userId}`
                },
                (payload) => {
                    toast.info(`Passes updated: ${payload.eventType}. Refreshing...`, { duration: 1500 });
                    fetchData(); // Trigger full data refetch
                }
            )
            .subscribe();

        // 2. Subscribe to 'queue' table changes
        const queueChannel = supabase
            .channel(`queue-for-teacher-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'queue',
                    filter: `teacher_id=eq.${userId}`
                },
                (payload) => {
                    toast.info(`Queue updated: ${payload.eventType}. Refreshing...`, { duration: 1500 });
                    fetchData(); // Trigger full data refetch
                }
            )
            .subscribe();

        // Cleanup function: Unsubscribe from channels when the component unmounts
        return () => {
            supabase.removeChannel(passesChannel);
            supabase.removeChannel(queueChannel);
        };

    }, [supabase, user.id, fetchData]);
    // The fetchData dependency is stable because it's wrapped in useCallback.

    // Data Filtering for Tabs
    const activePasses = React.useMemo(() => {
        return passes.filter(p => !p.timeIn);
    }, [passes]);

    const historyPasses = React.useMemo(() => {
        return passes.filter(p => p.timeIn);
    }, [passes]);


    // --- UI COMPONENTS (Integrated for simplicity) ---

    const ModeSwitcher = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <IconReload className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Opening TV Mode in new tab...")}>
                    Open TV Display
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("TV Settings toggled!")}>
                    Toggle TV Mode ON/OFF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const UserProfile = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <IconUser className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-sm font-medium">
                    {user.name} ({user.email})
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("Logout action initiated.")}>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );


    return (
        <Tabs defaultValue="active" className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>

                <div className="flex items-center space-x-2">
                    <ModeSwitcher />
                    <UserProfile />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        disabled={isLoading}
                    >
                        {isLoading ? <IconReload className="h-4 w-4 mr-2 animate-spin" /> : <IconReload className="h-4 w-4 mr-2" />}
                        Refresh
                    </Button>
                </div>
            </div>

            <TabsList>
                <TabsTrigger value="active">Active Passes ({activePasses.length})</TabsTrigger>
                <TabsTrigger value="history">Pass History ({historyPasses.length})</TabsTrigger>
                <TabsTrigger value="queue">Line Queue ({queue.length})</TabsTrigger>
                <TabsTrigger value="schedule">Schedule & CLO</TabsTrigger>
            </TabsList>

            {/* Active Passes Tab Content */}
            <TabsContent value="active" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Active Passes</CardTitle>
                        <CardDescription>Click the action menu in the table to mark a pass as Time In.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={activePasses}
                            teacherId={user.id}
                            onDataRefetch={fetchData}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Pass History Tab Content */}
            <TabsContent value="history" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Completed Pass History</CardTitle>
                        <CardDescription>Filterable record of all completed passes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={historyPasses}
                            teacherId={user.id}
                            onDataRefetch={fetchData}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Line Queue Management Tab */}
            <TabsContent value="queue" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Student Line Queue</CardTitle>
                        <CardDescription>Manually start a pass or remove a student from the waiting line.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <QueueTable
                            teacherId={user.id}
                            queue={queue}
                            onDataRefetch={fetchData}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Placeholder for other tabs */}
            <TabsContent value="schedule">Schedule configuration goes here...</TabsContent>
        </Tabs>
    );
}
