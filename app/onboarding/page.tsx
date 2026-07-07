import { requireRole } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { OnboardingWizard } from "./wizard";

export const metadata = { title: "Let's get you set up" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const profile = await requireRole(["parent", "super_admin"]);
  const supabase = await createServerSupabase();

  const [{ data: subjects }, { data: packages }, { data: slots }] = await Promise.all([
    supabase.from("subjects").select("id, name, emoji, color").eq("active", true).order("id"),
    supabase
      .from("packages")
      .select("slug, name, emoji, lessons_per_month, price_cents, per_lesson_cents, save_cents, blurb, popular")
      .eq("active", true)
      .order("price_cents"),
    supabase.rpc("get_open_slots", { p_days: 14 }),
  ]);

  const { package: preselected } = await searchParams;

  return (
    <OnboardingWizard
      profile={{ full_name: profile.full_name, phone: profile.phone ?? "" }}
      subjects={subjects ?? []}
      packages={packages ?? []}
      slots={(slots ?? []) as { slot_at: string; mode: string; duration_minutes: number }[]}
      preselectedPackage={preselected ?? null}
    />
  );
}
