import { PortalShell } from "@/components/portal/shell";
import { getNotices } from "@/lib/notices";
import { requireRole } from "@/lib/rbac";

const NAV = [
  { href: "/parent", label: "Dashboard", icon: "dashboard" },
  { href: "/parent/kids", label: "My children", icon: "students" },
  { href: "/parent/book", label: "Book a lesson", icon: "calender" },
  { href: "/parent/billing", label: "Invoices", icon: "reports" },
  { href: "/parent/messages", label: "Messages", icon: "messages" },
];

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["parent", "super_admin"]);
  const notices = await getNotices();
  return (
    <PortalShell role="parent" userName={profile.full_name || "Parent"} nav={NAV} notices={notices}>
      {children}
    </PortalShell>
  );
}
