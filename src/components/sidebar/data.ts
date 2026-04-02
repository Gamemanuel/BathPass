import {
    Wallpaper,
    CalendarClock,
    Backpack,
    ClipboardClock,
    History,
    LayoutDashboard,
} from "lucide-react";

export const data = {
    navMain: [
        {
            name: "Overview",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Classes",
            url: "/dashboard/classes",
            icon: Backpack,
        },
        {
            name: "Line",
            url: "/dashboard/line",
            icon: ClipboardClock,
        },
        {
            name: "History",
            url: "/dashboard/history",
            icon: History,
        },
    ],
    tvMode: [
        {
            name: "TV Settings",
            url: "/dashboard/tv-settings",
            icon: Wallpaper,
        },
        {
            name: "Schedule / CLO",
            url: "/dashboard/schedules",
            icon: CalendarClock,
        },
    ],
}