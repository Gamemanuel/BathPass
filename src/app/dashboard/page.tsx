import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UserAvatar from "@/components/UserAvatar";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // ...User is authenticated
    return (
        <section>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome, {user.user_metadata?.name || user.email}!</p>
            {/* Avatar rendering below */}
            <UserAvatar user={user} />
        </section>
    );
}
