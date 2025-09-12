// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error_description");
    // if you passed next=/dashboard in the redirectTo, pick it up here
    const nextPath = url.searchParams.get("next") ?? "/dashboard";

    if (error) {
        // you could flash an error here or log
        return NextResponse.redirect(new URL("/login?error=" + error, url.origin));
    }

    if (code) {
        const supabase = createRouteHandlerClient({ cookies });
        // exchange the OAuth code for a session cookie
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL(nextPath, url.origin));
}
