"use client"

import * as React from "react"
import { format, parseISO, isValid, setHours, setMinutes } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle, DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"

import { Pass } from "./columns" // Import Pass type

interface TableCellViewerProps {
    item: Pass;
    handleUpdateRow: (id: string, field: keyof Pass, value: string | null) => Promise<void>;
}

// Utility function to format the PostgreSQL interval string for display (repeated here for self-contained component)
const formatInterval = (interval: string | null): string => {
    if (!interval) return 'N/A';
    const match = interval.match(/(?:(\d+) days? )?(\d{2}):(\d{2}):(\d{2})/)
    if (match) {
        const [,,h,m,s] = match.map(Number);
        const days = parseInt(match[1] || '0');
        let totalTime = "";
        if (days > 0) totalTime += `${days}d `;
        if (h > 0) totalTime += `${h}h `;
        totalTime += `${m}m ${s}s`;
        return totalTime.trim();
    }
    return interval;
}

// Client-side utility for live preview
const calculateLiveTimeGone = (timeIn: Date | undefined, timeOut: string | null): string => {
    if (!timeOut) return 'N/A';
    try {
        const startTime = new Date(timeOut).getTime();
        const endTime = timeIn ? timeIn.getTime() : new Date().getTime(); // If not returned, use now
        if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return 'Invalid';

        const diff = endTime - startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    } catch (e) {
        return 'Error';
    }
}


export default function TableCellViewer({ item, handleUpdateRow }: TableCellViewerProps) {
    const isMobile = useIsMobile()
    const [name, setName] = React.useState(item.name || "")
    const [destination, setDestination] = React.useState(item.destination || "")
    const [timeReturned, setTimeReturned] = React.useState<Date | undefined>(
        item.time_returned && isValid(parseISO(item.time_returned)) ? parseISO(item.time_returned) : undefined
    )

    // Sync internal state with props on initial load/data change
    React.useEffect(() => {
        setName(item.name || "")
        setDestination(item.destination || "")
        setTimeReturned(
            item.time_returned && isValid(parseISO(item.time_returned)) ? parseISO(item.time_returned) : undefined
        )
    }, [item])

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setTimeReturned(undefined)
            return
        }

        let newDate = selectedDate
        if (timeReturned) {
            newDate = setHours(newDate, timeReturned.getHours())
            newDate = setMinutes(newDate, timeReturned.getMinutes())
        } else {
            const now = new Date()
            newDate = setHours(newDate, now.getHours())
            newDate = setMinutes(newDate, now.getMinutes())
        }
        setTimeReturned(newDate)
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value: timeStr } = e.target;
        const [hours, minutes] = timeStr.split(':').map(Number);

        let newDate = timeReturned ? new Date(timeReturned) : new Date();

        if (!isNaN(hours)) newDate = setHours(newDate, hours);
        if (!isNaN(minutes)) newDate = setMinutes(newDate, minutes);

        setTimeReturned(newDate);
    }

    const timeValue = timeReturned ? format(timeReturned, 'HH:mm') : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const updates: { field: keyof Pass, value: string | null }[] = []

        if (name !== item.name) {
            updates.push({ field: 'name', value: name.trim() || null }) // Maps to student_name
        }
        if (destination !== item.destination) {
            updates.push({ field: 'destination', value: destination.trim() || null })
        }

        const newTimeReturnedIso = timeReturned ? timeReturned.toISOString() : null;
        if (newTimeReturnedIso !== item.time_returned) {
            updates.push({ field: 'time_returned', value: newTimeReturnedIso }) // Maps to time_in
        }

        if (updates.length === 0) {
            toast.info("No changes to save.")
            return
        }

        toast.promise(Promise.all(updates.map(update => handleUpdateRow(item.id, update.field, update.value))), {
            loading: 'Saving changes...',
            success: 'Pass details updated successfully!',
            error: 'Failed to save all changes.',
        });
    }

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-fit px-0 text-left font-semibold">
                    {item.name || "N/A"}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Edit Pass for: {item.name || "N/A"}</DrawerTitle>
                    <DrawerDescription>
                        Pass ID: {item.id.substring(0, 8)}...
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <Separator />
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="name">Student Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="destination">Destination</Label>
                            <Input
                                id="destination"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="time-out">Time Out</Label>
                                <Input
                                    id="time-out"
                                    defaultValue={item.time_out ? format(parseISO(item.time_out), "MMM dd, yyyy HH:mm") : 'N/A'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="time-returned">Time In</Label> {/* <--- RENAMED LABEL */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background text-foreground hover:bg-muted/50",
                                                !timeReturned && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {timeReturned ? format(timeReturned, "MMM dd, yyyy HH:mm") : <span>Set return time</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={timeReturned}
                                            onSelect={handleDateSelect}
                                            initialFocus
                                        />
                                        <div className="p-3 border-t">
                                            <Input
                                                type="time"
                                                onChange={handleTimeChange}
                                                value={timeValue}
                                                className="bg-background text-foreground"
                                            />
                                        </div>
                                        {timeReturned && (
                                            <div className="p-3 border-t">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="w-full text-center text-red-500"
                                                    onClick={() => setTimeReturned(undefined)}
                                                >
                                                    Clear Date/Time
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Time Total (DB Value)</Label>
                            <div className="text-lg font-bold">
                                {formatInterval(item.time_total)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label>Live Time Gone (Local)</Label>
                            <div className="text-sm font-medium text-muted-foreground">
                                {calculateLiveTimeGone(timeReturned, item.time_out)}
                            </div>
                        </div>
                    </form>
                </div>
                <DrawerFooter>
                    <Button onClick={handleSubmit} type="submit">Save Changes</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}