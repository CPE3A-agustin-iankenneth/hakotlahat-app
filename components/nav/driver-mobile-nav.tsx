"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  CalendarDays,
  Trophy,
  Bell,
  Leaf,
  CircleUserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/drv", label: "Route", icon: Map },
  { href: "/drv/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/drv/points", label: "Points", icon: Trophy },
  { href: "/drv/alerts", label: "Alerts", icon: Bell, badge: 3 },
];

export function DriverMobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-stone-800 bg-stone-950/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-stone-950/80">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500">
          <Leaf className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-stone-100">HakotLahat</span>
      </div>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-stone-500 hover:bg-stone-900 hover:text-stone-300"
      >
        <Link href="/drv/account">
          <CircleUserRound className="h-5 w-5" />
          <span className="sr-only">Account</span>
        </Link>
      </Button>
    </header>
  );
}

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-3xl border-t border-stone-800 bg-stone-950 px-2 pb-6 pt-3 shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.4)]">
      {navItems.map(({ href, label, icon: Icon, badge }) => {
        const isActive = href === "/drv"
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-1 transition-colors",
              isActive
                ? "text-green-400"
                : "text-stone-500 hover:text-stone-300",
            )}
          >
            {isActive && (
              <span className="absolute -top-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-green-500" />
            )}
            <div className="relative">
              <Icon className="h-[20px] w-[20px] shrink-0" />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isActive ? "text-green-400" : "text-stone-500",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
