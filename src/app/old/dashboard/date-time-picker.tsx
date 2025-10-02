"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        // Preserve time if a date is already set, otherwise default to current time
        const newDate = new Date(selectedDate);
        if (date) {
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
        }
        setDate(newDate);
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const [hours, minutes] = value.split(':').map(Number);

        const newDate = date ? new Date(date) : new Date();
        if (!isNaN(hours)) newDate.setHours(hours);
        if (!isNaN(minutes)) newDate.setMinutes(minutes);

        setDate(newDate);
    }

    const timeValue = date ? format(date, 'HH:mm') : '';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal bg-transparent text-white border-gray-600 hover:bg-gray-800 hover:text-white",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                />
                <div className="p-3 border-t border-gray-700">
                    <Input
                        type="time"
                        onChange={handleTimeChange}
                        value={timeValue}
                        className="bg-transparent border-gray-600 text-white"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}