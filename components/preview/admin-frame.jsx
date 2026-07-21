"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { ThemeProvider } from "@/components/admin/theme-provider";

const PROFILE = {
  id: "preview-user",
  full_name: "Ngozi Balogun",
  email: "ngozi@candor-management.com",
  role: "ceo",
};

// Chrome-accurate shell for the admin preview pages.
export function AdminFrame({ children }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AdminSidebar profile={PROFILE} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar profile={PROFILE} />
            <main className="flex-1 px-6 py-8 md:px-8">
              <div className="mx-auto w-full max-w-[1280px]">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
