import { createClient } from "@/lib/supabase/server"; // Correctly import the server client
import { NavUserClient } from "@/components/nav-user"; // Import the client component we'll update next

export async function NavUser() {
    const supabase = await createClient(); // Use the server client

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If there is no user, we don't need to render anything.
    if (!user) {
        return null;
    }

    // Fetch the user's profile to get TV mode status
    // We add a fallback in case the profile doesn't exist yet.
    const { data: profile } = await supabase
        .from("profiles")
        .select("tv_mode_enabled")
        .eq("id", user.id)
        .single();

    // Structure the user data to pass to the client component
    const userData = {
        name: user.user_metadata?.name || user.email || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url || "",
    };

    const tvModeEnabled = profile?.tv_mode_enabled ?? false;

    // Render the Client Component with the fetched data as props
    return <NavUserClient user={userData} tvModeEnabled={tvModeEnabled} />;
}