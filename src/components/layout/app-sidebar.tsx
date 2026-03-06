"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  ScanLine,
  PackagePlus,
  MinusCircle,
  Merge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserPicker } from "./user-picker";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Receive", href: "/inventory/receive", icon: PackagePlus },
  { name: "Quick Use", href: "/inventory/quick-use", icon: MinusCircle },
  { name: "Merge Items", href: "/inventory/merge", icon: Merge },
  { name: "Jobs", href: "/jobs", icon: ClipboardList },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Packing Slips", href: "/packing-slips", icon: ScanLine },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Package className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Inventory Pro</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const inventorySubpages = ["/inventory/receive", "/inventory/quick-use", "/inventory/merge"];
          const isInventorySubpage = inventorySubpages.includes(item.href);
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href) && !isInventorySubpage && item.href !== "/inventory") ||
            (item.href === "/inventory" && pathname === "/inventory") ||
            (item.href === "/inventory" && pathname.startsWith("/inventory/") && !inventorySubpages.some(sub => pathname.startsWith(sub))) ||
            (isInventorySubpage && pathname === item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Logged in as</p>
          <UserPicker />
        </div>
        <p className="text-xs text-muted-foreground">Inventory Pro · v0.1</p>
      </div>
    </aside>
  );
}
