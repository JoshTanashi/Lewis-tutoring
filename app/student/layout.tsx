import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";

const NAV = [
  { href: "/student", label: "My Space", icon: "dashboard" },
  { href: "/student/homework", label: "Homework", icon: "assignments" },
  { href: "/student/journey", label: "My Journey", icon: "progress" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["student", "super_admin"]);
  const supabase = await createServerSupabase();
  const { data: student } = await supabase
    .from("students")
    .select("full_name")
    .eq("auth_user_id", profile.id)
    .maybeSingle();

  return (
    <PortalShell
      role="student"
      userName={student?.full_name?.split(" ")[0] ?? profile.full_name ?? "Superstar"}
      nav={NAV}
      kidMode
    >
      {children}
    </PortalShell>
  );
}
