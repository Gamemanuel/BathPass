// src/lib/class-schedule-utils.ts

import { createClient } from '@/lib/supabase/client';

// Define the core types for returned data
interface ClassDetails {
    class_id: string;
    class_name: string;
    start_time: string; // TIME format (HH:MM:SS)
    end_time: string;   // TIME format (HH:MM:SS)
}

interface CLO {
    clo_text: string;
    is_out_of_class: boolean;
}

interface ScheduleResult {
    currentClass: ClassDetails | null;
    nextClass: ClassDetails | null;
    currentCLO: CLO | null;
}

/**
 * Gets the current class slot and its corresponding CLO based on the current time and date.
 * @param teacherId The ID of the current teacher.
 * @returns An object containing the current class/time and its CLO.
 */
export async function getCurrentClassAndCLO(teacherId: string): Promise<ScheduleResult> {
    const supabase = createClient();
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Fetch the repeating schedule for today
    const { data: scheduleData, error: scheduleError } = await supabase
        .from('class_schedule')
        .select(`
            class_id,
            start_time,
            end_time,
            classes (class_name)
        `)
        .eq('day', dayOfWeek)
        .eq('is_active', true)
        .order('start_time');

    if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError);
        return { currentClass: null, nextClass: null, currentCLO: null };
    }

    // 2. Find the active class and the next class
    let currentSlot: ClassDetails | null = null;
    let nextSlot: ClassDetails | null = null;

    for (const slot of scheduleData as any[]) {
        const slotStartTime = slot.start_time;
        const slotEndTime = slot.end_time;
        const className = slot.classes.class_name;
        const slotDetails: ClassDetails = {
            class_id: slot.class_id,
            class_name: className,
            start_time: slotStartTime,
            end_time: slotEndTime
        };

        // Check if current time falls within the slot
        if (currentTime >= slotStartTime && currentTime < slotEndTime) {
            currentSlot = slotDetails;
        }

        // Find the next upcoming slot
        if (currentTime < slotStartTime && !nextSlot && !currentSlot) {
            nextSlot = slotDetails;
        }
    }

    // 3. Fetch the CLO (for the current class or the "Out of Class" CLO)
    let cloResult: CLO | null = null;
    let currentCLOId = currentSlot?.class_id;

    if (!currentCLOId) {
        // If no class is active, look for the 'Out of Class' CLO
        const { data: outOfClassCLO } = await supabase
            .from('current_clo')
            .select('clo_text, is_out_of_class')
            .eq('teacher_id', teacherId)
            .eq('is_out_of_class', true)
            .limit(1)
            .single();

        cloResult = outOfClassCLO || null;
    } else {
        // Look for the CLO linked to the current class, valid for today
        const { data: classCLO } = await supabase
            .from('current_clo')
            .select('clo_text, is_out_of_class')
            .eq('teacher_id', teacherId)
            .eq('class_id', currentCLOId)
            .lte('start_date', today)
            .gte('end_date', today)
            .limit(1)
            .single();

        cloResult = classCLO || null;
    }

    return {
        currentClass: currentSlot,
        nextClass: nextSlot,
        currentCLO: cloResult,
    };
}