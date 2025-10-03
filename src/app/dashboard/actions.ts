'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'

export async function handleSignOut() {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()

    // ✅ Now it's safe to modify cookies
    // @ts-expect-error because it is stupid
    cookies().set('your-cookie-name', '', { maxAge: -1 })

    redirect('/auth/login')
}