import { PortalShell } from "@/components/portal/shell";
import { getNotices } from "@/lib/notices";
import { requireRole } from "@/lib/rbac";

const NAV = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/people", label: "Students & parents", icon: "students" },
  { href: "/admin/tutors", label: "Tutors", icon: "tutor" },
  { href: "/admin/applications", label: "Applications", icon: "discussion" },
  { href: "/admin/calendar", label: "Calendar", icon: "calender" },
  { href: "/admin/audit", label: "Audit log", icon: "notes" },
  { href: "/admin/settings", label: "Settings & roles", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["super_admin"]);
  const notices = await getNotices();
  return (
    <PortalShell role="super_admin" userName={profile.full_name || "Super Admin"} nav={NAV} notices={notices}>
      {children}
    </PortalShell>
  );
}
