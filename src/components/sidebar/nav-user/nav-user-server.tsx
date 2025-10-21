import { createClient } from "@/lib/supabase/server"; // Correctly import the server client
import { NavUserClient } from "@/components/sidebar/nav-user/nav-user"; // Import the client component we'll update next

export async function NavUser() {
    const supabase = await createClient(); // Use the server client

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If there is no user, we don't need to render anything.
    if (!user) {
        return null;
    }

    // Structure the user data to pass to the client component
    const userData = {
        name: user.user_metadata?.name || user.email || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url || "",
    };

    // Render the Client Component with the fetched data as props
    return <NavUserClient user={userData} />;
}