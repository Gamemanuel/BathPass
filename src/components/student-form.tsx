// src/components/student-form.tsx

"use client"

import * as React from "react"
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconUsers, IconDoorEnter } from "@tabler/icons-react"
import { toast } from 'sonner'

// Define the core data structure for the line
interface QueueStatus {
    id: string;
    student_name: string;
    destination: string;
    position: number;
    time_joined: string;
}

interface StudentData {
    id: string; // Supabase Auth ID
    name: string;
    isSSO: boolean;
}

export function StudentForm({ teacherId, studentData }: { teacherId: string, studentData?: StudentData }) {
    const supabase = createClient();

    // State for form inputs
    const [name, setName] = React.useState(studentData?.name || '');
    const [destination, setDestination] = React.useState('');
    // Automatically set to Tablet Mode if no SSO data is passed
    const [isTabletMode, setIsTabletMode] = React.useState(!studentData?.isSSO);
    const [queueStatus, setQueueStatus] = React.useState<QueueStatus[]>([]);
    const [isProcessing, setIsProcessing] = React.useState(false);

    // Check if the student is currently in the queue
    const isInLine = React.useMemo(() => {
        return queueStatus.some(item => item.student_name === name);
    }, [queueStatus, name]);


    // 1. Fetch Line Status and Subscribe to real-time changes
    const fetchQueueStatus = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('queue')
            .select('id, student_name, destination, position, time_joined')
            .eq('teacher_id', teacherId)
            .order('position', { ascending: true });

        if (error) {
            console.error('Error fetching queue:', error);
            return;
        }
        setQueueStatus(data || []);
    }, [supabase, teacherId]);

    React.useEffect(() => {
        fetchQueueStatus();

        const channel = supabase.channel('queue_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'queue', filter: `teacher_id=eq.${teacherId}` }, fetchQueueStatus)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchQueueStatus, supabase, teacherId]);


    // 2. Handle Joining the Line / Immediate Pass
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !destination) {
            toast.error('Name and destination are required.');
            return;
        }

        setIsProcessing(true);

        const lineIsEmpty = queueStatus.length === 0;
        const newPosition = queueStatus.length + 1;

        if (lineIsEmpty) {
            // Option A: Go Immediately (Create a Pass)
            const { error } = await supabase.from('passes').insert({
                teacher_id: teacherId,
                student_id: studentData?.id || null, // NULL for tablet/guest
                student_name: name,
                destination: destination,
                time_out: new Date().toISOString(),
                is_tablet_user: isTabletMode,
            });

            if (error) {
                console.error('Pass insertion error:', error);
                toast.error('Failed to start pass. Try again.');
            } else {
                toast.success(`Pass started for ${name}. Return soon!`);
            }
        } else {
            // Option B: Join the Line
            const { error } = await supabase.from('queue').insert({
                teacher_id: teacherId,
                student_id: studentData?.id || null,
                student_name: name,
                destination: destination,
                position: newPosition,
            });

            if (error) {
                console.error('Queue insertion error:', error);
                toast.error('Failed to join line. Try again.');
            } else {
                toast.success(`${name}, you've joined the line!`);
            }
        }

        setIsProcessing(false);
    };

    const peopleInLine = queueStatus.length;
    const actionText = peopleInLine === 0 ? 'Go Now' : 'Join The Line';

    return (
        <div className="max-w-md mx-auto p-6 space-y-6 bg-white rounded-xl shadow-lg border">
            <h1 className="text-3xl font-bold text-center">Sign Out / Queue</h1>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <IconUsers className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-blue-700">Line Status:</span>
                </div>
                <span className="text-lg font-extrabold text-blue-900">
                    {peopleInLine} {peopleInLine === 1 ? 'Person' : 'People'}
                </span>
            </div>

            {/* Queue Visibility */}
            <div className="space-y-4">
                {isInLine ? (
                    <p className="text-center text-green-600 font-medium">You are already in line!</p>
                ) : peopleInLine === 0 ? (
                    <p className="text-center text-green-600 font-medium">The line is clear. You can go now!</p>
                ) : (
                    <>
                        <p className="text-center text-red-600 font-medium">
                            {peopleInLine} people ahead of you.
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                            {queueStatus.slice(0, 3).map((item, index) => (
                                <li key={item.id} className={index === 0 ? "font-bold text-gray-800" : ""}>
                                    {index === 0 ? 'Next' : (index + 1) + '.'} {item.student_name} ({item.destination})
                                </li>
                            ))}
                            {peopleInLine > 3 && <li>... and {peopleInLine - 3} more.</li>}
                        </ol>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input (Locked if SSO) */}
                <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isTabletMode}
                        required
                        className={!isTabletMode ? "bg-gray-100" : ""}
                        placeholder={isTabletMode ? "Enter your name" : studentData?.name}
                    />
                    {studentData?.isSSO && (
                        <p className="text-xs text-muted-foreground">Signed in via SSO. Name is locked.</p>
                    )}
                </div>

                {/* Destination Select */}
                <div className="space-y-2">
                    <Label htmlFor="destination">Going To</Label>
                    <Select required onValueChange={setDestination}>
                        <SelectTrigger id="destination">
                            <SelectValue placeholder="Select a destination" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Restroom">Restroom</SelectItem>
                            <SelectItem value="Nurse">Nurse</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Locker">Locker</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing || !destination || isInLine}
                >
                    <IconDoorEnter className="h-5 w-5 mr-2" />
                    {isProcessing
                        ? 'Processing...'
                        : isInLine ? 'Already In Line' : actionText
                    }
                </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
                Your time out will be automatically stamped.
            </p>
        </div>
    );
}