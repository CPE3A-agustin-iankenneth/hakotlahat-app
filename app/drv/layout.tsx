import { DriverSidebar } from "@/components/nav/driver-sidebar";
import { DriverMobileHeader, DriverBottomNav } from "@/components/nav/driver-mobile-nav";
import { ThemeProvider } from "next-themes";

export default function DriverLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider attribute="class" forcedTheme="dark">
            <div className="flex h-screen overflow-hidden bg-stone-950">
            {/* Desktop: Sidebar — hidden on mobile */}
            <div className="hidden md:flex">
                <DriverSidebar />
            </div>

            {/* Main content area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile: sticky header — hidden on desktop */}
                <div className="md:hidden">
                    <DriverMobileHeader />
                </div>

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Bottom padding on mobile so content isn't hidden behind the bottom nav */}
                    <div className="pb-24 md:pb-0">{children}</div>
                </main>

                {/* Mobile: fixed bottom nav — hidden on desktop */}
                <div className="md:hidden">
                    <DriverBottomNav />
                </div>
            </div>
            </div>
        </ThemeProvider>
    );
}
