import { PortalShell } from "@/components/portal/shell";
import { getNotices } from "@/lib/notices";
import { requireRole } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["student", "super_admin"]);
  const supabase = await createServerSupabase();
  const [{ data: student }, notices] = await Promise.all([
    supabase
      .from("students")
      .select("full_name, age_band, is_self")
      .eq("auth_user_id", profile.id)
      .maybeSingle(),
    getNotices(),
  ]);

  const teen = student?.age_band === "teen";
  const nav = [
    { href: "/student", label: teen ? "Dashboard" : "My Space", icon: "dashboard" },
    { href: "/student/homework", label: "Homework", icon: "assignments" },
    { href: "/student/journey", label: teen ? "My progress" : "My Journey", icon: "progress" },
    // older self-signed-up students run their own bookings & billing
    ...(student?.is_self
      ? [
          { href: "/student/book", label: "Book lessons", icon: "calender" },
          { href: "/student/billing", label: "Billing", icon: "reports" },
        ]
      : []),
  ];

  return (
    <PortalShell
      role="student"
      userName={student?.full_name?.split(" ")[0] ?? profile.full_name ?? "Superstar"}
      nav={nav}
      kidMode={!teen}
      notices={notices}
    >
      {children}
    </PortalShell>
  );
}
