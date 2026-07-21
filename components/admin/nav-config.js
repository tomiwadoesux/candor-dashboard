// Admin navigation — shared by the sidebar and the ⌘K palette.
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clapperboard,
  MessageSquare,
  Receipt,
  FileText,
  Award,
  BarChart3,
  Settings,
  Megaphone,
  Sparkles,
  Wrench,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { title: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { title: "Talent roster", href: "/admin/talent", icon: Users },
      { title: "Clients", href: "/admin/clients", icon: Building2 },
      { title: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { title: "Casting board", href: "/admin/casting", icon: Clapperboard },
    ],
  },
  {
    label: "Agency",
    items: [
      { title: "Messages", href: "/admin/communications", icon: MessageSquare },
      { title: "Community feed", href: "/admin/community", icon: Megaphone },
      { title: "Milestones", href: "/admin/milestones", icon: Award },
      { title: "Documents", href: "/admin/documents", icon: FileText },
      { title: "AI activity", href: "/admin/ai-activity", icon: Sparkles },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Invoicing", href: "/admin/invoicing", icon: Receipt },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { title: "Tools", href: "/admin/tools", icon: Wrench },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const QUICK_ACTIONS = [
  { title: "New booking", href: "/admin/bookings/new" },
  { title: "Add talent", href: "/admin/talent/new" },
  { title: "Post a casting", href: "/admin/casting/new" },
  { title: "Send a message", href: "/admin/communications" },
];
