import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { requireRole, ADMIN_ROLES } from "@/lib/auth";

export const metadata = {
  title: "Candor · Admin",
  description: "Talent management operations for Candor Agency",
};

export default async function AdminLayout({ children }) {
  const profile = await requireRole(...ADMIN_ROLES);
  const plainProfile = {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role,
  };
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AdminSidebar profile={plainProfile} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar profile={plainProfile} />
            <main className="flex-1 px-8 py-8 slide-up-in">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
