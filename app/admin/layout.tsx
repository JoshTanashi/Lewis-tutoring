import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/rbac";

const NAV = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/users", label: "Users & roles", icon: "students" },
  { href: "/admin/audit", label: "Audit log", icon: "notes" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["super_admin"]);
  return (
    <PortalShell role="super_admin" userName={profile.full_name || "Super Admin"} nav={NAV}>
      {children}
    </PortalShell>
  );
}
