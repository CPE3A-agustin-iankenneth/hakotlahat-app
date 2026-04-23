import { AdminSidebar } from "@/components/nav/admin-sidebar";
import {
  AdminBottomNav,
  AdminMobileHeader,
} from "@/components/nav/admin-mobile-nav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop: Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile: sticky header — hidden on desktop */}
        <div className="md:hidden">
          <AdminMobileHeader />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Bottom padding on mobile so content isn't hidden behind the bottom nav */}
          <div className="pb-24 md:pb-0">{children}</div>
        </main>

        {/* Mobile: fixed bottom nav — hidden on desktop */}
        <div className="md:hidden">
          <AdminBottomNav />
        </div>
      </div>
    </div>
  );
}
