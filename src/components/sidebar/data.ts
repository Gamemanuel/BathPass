import {
    Wallpaper,
    CalendarClock,
    NotebookPen,
    Backpack,
    ClipboardClock,
} from "lucide-react";

export const data = {
    navMain: [
        {
            name: "View Line",
            url: "/dashboard/line",
            icon: ClipboardClock,
        },
    ],
    tvMode: [
        {
            name: "Manage Backgrounds",
            url: "/dashboard/backgrounds",
            icon: Wallpaper,
        },
        {
            name: "Configure Classes",
            url: "/dashboard/classes",
            icon: Backpack,
        },
        {
            name: "Configure CLO",
            url: "/dashboard/clo",
            icon: NotebookPen,
        },
        {
            name: "Edit Schedule",
            url: "/dashboard/schedule",
            icon: CalendarClock,
        },
    ],
}