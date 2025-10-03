import { NavUser } from "@/components/nav-user-server"; // Import the new SERVER component
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
    return (
        <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <h1 className="text-base font-medium">Bath Pass Teacher Dashboard</h1>
                <div className="ml-auto flex items-center gap-2">
                    <ModeToggle />
                    <NavUser />
                </div>
            </div>
        </header>
    );
}