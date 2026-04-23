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

export function MunicipalityMobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-foreground">HakotLahat</span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Admin
        </span>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
        <CircleUserRound className="h-5 w-5" />
        <span className="sr-only">Account</span>
      </Button>
    </header>
  );
}

export function MunicipalityBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-3xl border-t border-border/15 bg-white px-2 pb-6 pt-3 shadow-[0px_-4px_20px_0px_rgba(26,28,28,0.06)]">
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
              "flex flex-col items-center gap-1 rounded-full px-3 py-1 transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
