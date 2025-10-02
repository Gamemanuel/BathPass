// nav-documents.tsx
"use client"

import {
  MoreHorizontal, // IconDots -> MoreHorizontal
  Folder, // IconFolder
  Share2, // IconShare3 -> Share2
  Trash2, // IconTrash -> Trash2
  type LucideIcon, // Icon -> LucideIcon
} from "lucide-react" // 💡 FIX: Changed from @tabler/icons-react

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavDocuments({
                               items,
                             }: {
  items: {
    name: string
    url: string
    icon: LucideIcon // 💡 FIX: Changed type
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Documents</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                        showOnHover
                        className="data-[state=open]:bg-accent rounded-sm"
                    >
                      <MoreHorizontal /> {/* 💡 FIX: IconDots -> MoreHorizontal */}
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                      className="w-24 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder className="mr-2 h-4 w-4" /> {/* Lucide icons need size/margin */}
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" /> {/* Lucide icons need size/margin */}
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> {/* Lucide icons need size/margin */}
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal className="text-sidebar-foreground/70" /> {/* 💡 FIX: IconDots -> MoreHorizontal */}
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
  )
}