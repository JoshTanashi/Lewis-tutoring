import { PortalShell } from "@/components/portal/shell";
import { getNotices } from "@/lib/notices";
import { requireRole } from "@/lib/rbac";

const NAV = [
  { href: "/tutor", label: "Dashboard", icon: "dashboard" },
  { href: "/tutor/schedule", label: "Schedule", icon: "schedule" },
  { href: "/tutor/students", label: "My students", icon: "students" },
  { href: "/tutor/homework", label: "Homework", icon: "assignments" },
  { href: "/tutor/messages", label: "Messages", icon: "messages" },
  { href: "/tutor/availability", label: "Availability", icon: "calender" },
];

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["tutor", "super_admin"]);
  const notices = await getNotices();
  return (
    <PortalShell role="tutor" userName={profile.full_name || "Tutor"} nav={NAV} notices={notices}>
      {children}
    </PortalShell>
  );
}
