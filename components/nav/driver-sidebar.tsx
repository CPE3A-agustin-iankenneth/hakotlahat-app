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

export function DriverSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-stone-800 bg-stone-950">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-stone-100">HakotLahat</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 pr-px">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 rounded-r-full px-6 py-4 text-[15px] font-medium transition-colors",
                isActive
                  ? "border-l-4 border-green-500 bg-stone-800 pl-[20px] text-green-400"
                  : "text-stone-500 hover:bg-stone-900 hover:text-stone-300",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account */}
      <div className="border-t border-stone-800 p-4">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start gap-3 text-stone-500 hover:bg-stone-900 hover:text-stone-300"
        >
          <Link href="/drv/account">
            <CircleUserRound className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Account</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}
