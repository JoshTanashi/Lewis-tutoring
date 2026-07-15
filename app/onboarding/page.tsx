import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { OnboardingWizard } from "./wizard";

export const metadata = { title: "Let's get you set up" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const supabase = await createServerSupabase();
  const profile = await getProfile(); // may be null — the wizard is public now

  const [{ data: subjects }, { data: packages }, { data: slots }] = await Promise.all([
    supabase.from("subjects").select("id, name, emoji").eq("active", true).order("id"),
    supabase
      .from("packages")
      .select("slug, name, emoji, lessons_per_month, price_cents, per_lesson_cents, save_cents, blurb, popular")
      .eq("active", true)
      .order("price_cents"),
    supabase.rpc("get_open_slots", { p_days: 21, p_tutor: null }),
  ]);

  const { package: preselected } = await searchParams;

  return (
    <OnboardingWizard
      subjects={subjects ?? []}
      packages={packages ?? []}
      slots={(slots ?? []) as { slot_at: string; duration_minutes: number; tutor_id: string | null }[]}
      preselectedPackage={preselected ?? null}
      existingUser={
        profile
          ? { email: profile.email ?? "", full_name: profile.full_name, phone: profile.phone ?? "" }
          : null
      }
    />
  );
}
