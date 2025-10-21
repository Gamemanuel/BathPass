"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NavUserClient } from "@/components/sidebar/nav-user/nav-user";

// Define data props
type UserData = {
    name: string;
    email: string;
    avatar: string;
};

export function NavUser() {
    // Set up state to hold the user data
    const [user, setUser] = useState<UserData | null>(null);

    // Use useEffect to fetch data on the client side
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                // If a user is found, structure the data
                const userData = {
                    name: user.user_metadata?.name || user.email || "User",
                    email: user.email || "",
                    avatar: user.user_metadata?.avatar_url || "",
                };
                // Set the user data in state
                setUser(userData);
            } else {
                // Ensure state is null if no user is found
                setUser(null);
            }
        };

        // Call the fetching function
        fetchUser().then();
    }, []); // The empty array [] means this effect runs once when the component mounts

    // If there is no user, render nothing (based on the state)
    if (!user) {
        return null;
    }

    // Once the state is set, render the client component
    return <NavUserClient user={user} />;
}