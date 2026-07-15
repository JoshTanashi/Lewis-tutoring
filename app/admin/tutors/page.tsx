import Link from "next/link";
import { EmptyState, PageTitle, fmtCents } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Tutors" };

export default async function TutorsPage() {
  const supabase = await createServerSupabase();
  const [{ data: tutors }, { data: commissions }, { data: profiles }] = await Promise.all([
    supabase.from("v_tutor_month").select("*").order("full_name"),
    supabase.from("tutor_commissions").select("tutor_id, cents_per_lesson"),
    supabase.from("profiles").select("id, role"),
  ]);

  const rateOf = (id: string | null) =>
    commissions?.find((c) => c.tutor_id === id)?.cents_per_lesson ?? 10000;
  const roleOf = (id: string | null) => profiles?.find((p) => p.id === id)?.role;

  return (
    <>
      <PageTitle
        title="Tutors 👩‍🏫"
        sub="Each tutor has their own space — activity, roster, commission and notes."
      />
      {!tutors?.length ? (
        <EmptyState title="No tutors yet" hint="Approve an application or promote a user in Settings." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tutors.map((t) => (
            <Link key={t.tutor_id} href={`/admin/tutors/${t.tutor_id}`} className="squash block">
              <Card className="h-full p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-lg">{t.full_name || "Unnamed tutor"}</p>
                  {roleOf(t.tutor_id) === "super_admin" && <Chip tone="lilac">👑 you/admin</Chip>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Chip tone="grass">⭐ {t.active_students ?? 0} active</Chip>
                  {(t.pending_students ?? 0) > 0 && (
                    <Chip tone="sunshine">⏳ {t.pending_students} pending</Chip>
                  )}
                  <Chip tone="sky">🎓 {t.lessons_this_month ?? 0} lessons this month</Chip>
                  {!t.active && <Chip tone="coral">paused</Chip>}
                </div>
                <p className="mt-3 text-xs font-bold text-ink-soft">
                  Commission {fmtCents(rateOf(t.tutor_id))}/lesson · expected{" "}
                  {fmtCents((t.lessons_this_month ?? 0) * rateOf(t.tutor_id))} this month
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
