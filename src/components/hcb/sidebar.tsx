"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/hcb/dashboard", icon: LayoutDashboard },
  { label: "Organizations", href: "/hcb/organizations", icon: Building2 },
  { label: "Transactions", href: "/hcb/transactions", icon: ReceiptText },
  { label: "Cards", href: "/hcb/cards", icon: CreditCard },
  { label: "Settings", href: "/hcb/settings", icon: Settings },
];

const ADMIN_ITEM: NavItem = {
  label: "Admin",
  href: "/hcb/admin",
  icon: ShieldCheck,
};

interface SidebarProps {
  isAdmin?: boolean;
  onSignOut?: () => void;
}

export function Sidebar({ isAdmin = false, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <div className="flex items-center border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="mr-3 p-1"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-lg font-bold text-indigo-600">HCB</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <Link href="/hcb/dashboard" className="text-xl font-bold text-indigo-600">
            HCB
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>

        {/* Sign out */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
