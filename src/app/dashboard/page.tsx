// src/app/dashboard/page.tsx
// This is the SERVER Component that fetches data and passes it to the client.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from "@/app/dashboard/dashboard-client";
// Note: We use the NAMED import { DashboardClient } from the client file.

// --- SERVER-SIDE INTERFACES (Matching the DB/Client definitions) ---
interface RawPassData {
    id: string;
    student_name: string;
    destination: string;
    time_out: string | null;
    time_in: string | null;
}

interface ClientPass {
    id: string;
    name: string;
    destination: string;
    timeOut: string | null;
    timeIn: string | null;
}

// --- SERVER-SIDE DATA FETCHING ---

const getInitialPasses = async (userId: string): Promise<RawPassData[]> => {
    const supabase = await createClient();

    // RLS policy on 'passes' must be set up for this to work
    const { data, error } = await supabase
        .from('passes')
        .select(`
            id,
            student_name,
            destination,
            time_out,
            time_in
        `)
        .eq('teacher_id', userId);

    if (error) {
        console.error("Server-side initial data fetch failed:", error);
        // CRITICAL FIX: Return an empty array on error, not nothing,
        // to satisfy the TypeScript return type.
        return [];
    }

    return data || [];
}

export default async function Page() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirect unauthenticated users
        return redirect('/login');
    }

    // 1. Fetch data for the passes table
    const rawInitialPasses = await getInitialPasses(user.id);

    // 2. Format the raw data to match the ClientPass interface
    const initialPasses: ClientPass[] = rawInitialPasses.map(p => ({
        id: p.id,
        name: p.student_name,
        destination: p.destination,
        timeOut: p.time_out,
        timeIn: p.time_in,
    }));

    // 3. Define a user object to pass down
    const clientUser = {
        id: user.id,
        email: user.email || '',
        name: (user.user_metadata?.name as string) || 'Teacher'
    };

    return (
        <div className="min-h-screen bg-background">
            {/* 4. Pass the required props */}
            <DashboardClient
                initialPasses={initialPasses}
                user={clientUser}
            />
        </div>
    );
}