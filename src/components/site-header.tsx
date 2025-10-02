// components/site-header.tsx
import {NavUserWrapper} from "@/components/nav-user"; // Renamed/New component
import * as React from "react";

// The header no longer imports static data
export function SiteHeader() {
    return (
        <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <h1 className="text-base font-medium">Bath Pass Teacher Dashboard</h1>
                <div className="ml-auto flex items-center gap-2">
                    {/* NavUserWrapper fetches and displays the user details */}
                    <NavUserWrapper />
                </div>
            </div>
        </header>
    )
}