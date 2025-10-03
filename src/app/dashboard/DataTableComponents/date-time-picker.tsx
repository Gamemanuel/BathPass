"use client"

import * as React from "react"
import { format, parseISO, setHours, setMinutes, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

// Renamed from DateTimePicker to TimePicker to match the usage in columns.tsx
interface TimePickerProps {
    value: string | null; // Expects an ISO string or null
    onChange: (isoString: string | null) => void;
}

// NOTE: This component is a refactoring of the provided date-time-picker.tsx
// to align with the prop types required by the columns.tsx (value: string | null, onChange: (iso) => void)
export default function TimePicker({ value, onChange }: TimePickerProps) {
    // Convert the ISO string value to a Date object for the internal state
    const dateValue = value && isValid(parseISO(value)) ? parseISO(value) : undefined;

    // Internal state to manage the selected date/time
    const [date, setDate] = React.useState<Date | undefined>(dateValue);

    // Update internal state when the external value prop changes
    React.useEffect(() => {
        const newDateValue = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
        setDate(newDateValue);
    }, [value]);


    // Function to handle changes and call the external onChange prop
    const handleDateChange = (newDate: Date | undefined) => {
        setDate(newDate);
        // Call external onChange with new ISO string or null
        onChange(newDate ? newDate.toISOString() : null);
    }

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            handleDateChange(undefined);
            return;
        }

        // Preserve time if a date is already set, otherwise default to current time
        let newDate = selectedDate;
        if (date) {
            newDate = setHours(newDate, date.getHours());
            newDate = setMinutes(newDate, date.getMinutes());
        } else {
            // If no existing date, default to current time for the newly selected day
            const now = new Date();
            newDate = setHours(newDate, now.getHours());
            newDate = setMinutes(newDate, now.getMinutes());
        }
        handleDateChange(newDate);
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value: timeStr } = e.target;
        const [hours, minutes] = timeStr.split(':').map(Number);

        // If no date is set, use today's date
        let newDate = date ? new Date(date) : new Date();

        if (!isNaN(hours)) newDate = setHours(newDate, hours);
        if (!isNaN(minutes)) newDate = setMinutes(newDate, minutes);

        handleDateChange(newDate);
    }

    // Display time in HH:mm format, or empty string if no date
    const timeValue = date ? format(date, 'HH:mm') : '';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-auto justify-start text-left font-normal bg-transparent text-white border-gray-600 hover:bg-gray-800 hover:text-white",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMM dd, yyyy HH:mm") : <span>Set return time</span>}
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
                {date && (
                    <div className="p-3 border-t border-gray-700">
                        <Button
                            variant="link"
                            size="sm"
                            className="w-full text-center text-red-400"
                            onClick={() => handleDateChange(undefined)}
                        >
                            Clear Date/Time
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}