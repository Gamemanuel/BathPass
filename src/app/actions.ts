"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function toggleTvMode() {
    const cookieStore = cookies()
    // @ts-expect-error because cookie store has not been created yet
    const supabase = await createClient(cookieStore)

    // Get the current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    // Get the user's current TV mode status
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("tv_mode_enabled")
        .eq("id", user.id)
        .single()

    if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is 'No rows found', which is okay. Other errors are not.
        console.error("Error fetching profile:", profileError)
        return
    }

    const currentState = profile?.tv_mode_enabled ?? false
    const newState = !currentState

    // Update the user's profile with the new state
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ tv_mode_enabled: newState })
        .eq("id", user.id)

    if (updateError) {
        console.error("Error updating TV mode:", updateError)
        return
    }

    revalidatePath("/dashboard")
}