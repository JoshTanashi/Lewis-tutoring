import { PageTitle } from "@/components/portal/widgets";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { UserTable } from "./user-table";

export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const supabase = await createServerSupabase();
  const me = (await getProfile())!;
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageTitle
        title="Users & roles 👥"
        sub="Change who can do what. Only super admins can change roles — the database enforces it."
      />
      <UserTable users={users ?? []} meId={me.id} />
    </>
  );
}
