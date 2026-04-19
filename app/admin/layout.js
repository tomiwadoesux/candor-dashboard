import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { ThemeProvider } from "@/components/admin/theme-provider";

export const metadata = {
  title: "Candor · Admin",
  description: "Talent management operations for Candor Agency",
};

export default function AdminLayout({ children }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar />
            <main className="flex-1 px-8 py-8 slide-up-in">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
