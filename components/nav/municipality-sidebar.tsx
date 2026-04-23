"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Route,
  BarChart3,
  Leaf,
  CircleUserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/mun", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mun/fleet", label: "Fleet", icon: Truck },
  { href: "/mun/requests", label: "Requests", icon: ClipboardList },
  { href: "/mun/routes", label: "Routes", icon: Route },
  { href: "/mun/reports", label: "Reports", icon: BarChart3 },
];

export function MunicipalitySidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-bold text-sidebar-foreground">
          HakotLahat
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 pr-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/mun"
              ? pathname === "/mun"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-r-full px-6 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Account */}
      <div className="border-t border-border p-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Municipality Admin
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-sidebar-foreground"
        >
          <CircleUserRound className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Account</span>
        </Button>
      </div>
    </aside>
  );
}
