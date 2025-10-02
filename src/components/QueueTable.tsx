// src/components/QueueTable.tsx

"use client";

import * as React from "react";
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconArrowRight, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

interface QueueItem {
    id: string;
    student_name: string;
    destination: string;
    position: number;
    time_joined: string;
}

interface QueueTableProps {
    teacherId: string;
    queue: QueueItem[];
    onDataRefetch: () => void;
}

// Utility to format time since joining
const timeSince = (isoString: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
};


export function QueueTable({ teacherId, queue, onDataRefetch }: QueueTableProps) {
    const supabase = createClient();
    const [isProcessing, setIsProcessing] = React.useState(false);

    // 1. Start Pass for the student
    const handleStartPass = async (item: QueueItem) => {
        setIsProcessing(true);

        // A. Insert a new record into the 'passes' table
        const { error: passError } = await supabase.from('passes').insert({
            teacher_id: teacherId,
            student_name: item.student_name,
            destination: item.destination,
            time_out: new Date().toISOString(),
        });

        if (passError) {
            toast.error(`Failed to start pass for ${item.student_name}.`);
            console.error("Pass insert error:", passError);
            setIsProcessing(false);
            return;
        }

        // B. Remove the item from the 'queue' table
        const { error: queueError } = await supabase.from('queue').delete().eq('id', item.id);

        if (queueError) {
            toast.warning(`Pass started, but failed to remove ${item.student_name} from line. Manual refresh needed.`);
            console.error("Queue delete error:", queueError);
            setIsProcessing(false);
            onDataRefetch();
            return;
        }

        toast.success(`Pass started for ${item.student_name}. Line updated.`);
        onDataRefetch();
        setIsProcessing(false);
    };

    // 2. Remove student from line without starting a pass
    const handleRemoveFromLine = async (id: string, name: string) => {
        const { error } = await supabase.from('queue').delete().eq('id', id);

        if (error) {
            toast.error(`Failed to remove ${name} from line.`);
            console.error("Queue delete error:", error);
        } else {
            toast.info(`${name} removed from the line.`);
            onDataRefetch();
        }
    }


    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                Total in line: {queue.length}. The person at the top has been waiting the longest.
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Time Waiting</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {queue.length > 0 ? (
                            queue.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.position}</TableCell>
                                    <TableCell>{item.student_name}</TableCell>
                                    <TableCell>{item.destination}</TableCell>
                                    <TableCell>{timeSince(item.time_joined)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isProcessing}
                                            onClick={() => handleRemoveFromLine(item.id, item.student_name)}
                                            title={`Remove ${item.student_name}`}
                                        >
                                            <IconTrash className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() => handleStartPass(item)}
                                        >
                                            {item.position === 1 ? "Start Pass" : "Override"}
                                            <IconArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    The queue is clear!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}