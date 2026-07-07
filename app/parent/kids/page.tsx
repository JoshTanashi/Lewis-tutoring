import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { KidsManager } from "./kids-manager";

export const metadata = { title: "My children" };

export default async function KidsPage() {
  const supabase = await createServerSupabase();
  const [{ data: kids }, { data: subjects }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, grade, mascot, username, confidence_score")
      .order("full_name"),
    supabase.from("subjects").select("id, name, emoji").eq("active", true).order("id"),
  ]);

  return (
    <>
      <PageTitle
        title="My children 🌟"
        sub="Manage their profiles and create their very own Kids' Door logins."
      />
      <KidsManager kids={kids ?? []} subjects={subjects ?? []} />
    </>
  );
}
