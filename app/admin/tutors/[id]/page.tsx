import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatThread, type ChatMessage } from "@/components/portal/chat";
import { AvailabilityEditor } from "@/app/tutor/availability/editor";
import { EmptyState, PageTitle, StatCard, fmtCents, fmtDate } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { TutorAdminPanel } from "./panel";

export const metadata = { title: "Tutor space" };

export default async function TutorSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const me = (await getProfile())!;

  const { data: tutor } = await supabase
    .from("tutor_profiles")
    .select("user_id, bio, meeting_url, active")
    .eq("user_id", id)
    .maybeSingle();
  if (!tutor) notFound();

  const [
    { data: person },
    { data: month },
    { data: commission },
    { data: tutorSubjects },
    { data: subjects },
    { data: roster },
    { data: recentLessons },
    { data: slots },
    { data: chat },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, role").eq("id", id).single(),
    supabase.from("v_tutor_month").select("*").eq("tutor_id", id).single(),
    supabase.from("tutor_commissions").select("cents_per_lesson").eq("tutor_id", id).maybeSingle(),
    supabase.from("tutor_subjects").select("subject_id").eq("tutor_id", id),
    supabase.from("subjects").select("id, name, emoji").eq("active", true).order("id"),
    supabase
      .from("students")
      .select("id, full_name, grade, assignment_status, wants_assessment")
      .eq("assigned_tutor_id", id)
      .order("full_name"),
    supabase
      .from("lessons")
      .select("id, scheduled_at, status, students(full_name), subjects(name, emoji)")
      .eq("tutor_id", id)
      .order("scheduled_at", { ascending: false })
      .limit(8),
    supabase
      .from("availability_slots")
      .select("id, weekday, start_time, active, tutor_id")
      .eq("tutor_id", id)
      .order("weekday")
      .order("start_time"),
    id === me.id
      ? Promise.resolve({ data: [] })
      : supabase
          .from("messages")
          .select("id, sender_id, body, created_at")
          .or(
            `and(sender_id.eq.${me.id},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${me.id})`,
          )
          .order("created_at")
          .limit(200),
  ]);

  const rate = commission?.cents_per_lesson ?? 10000;
  const expected = (month?.lessons_this_month ?? 0) * rate;

  return (
    <>
      <PageTitle
        title={
          <>
            {person?.full_name || "Tutor"}{" "}
            {person?.role === "super_admin" && <Chip tone="lilac">👑 admin-tutor</Chip>}
            {!tutor.active && <Chip tone="coral">paused</Chip>}
          </>
        }
        sub={
          <>
            {person?.phone && `${person.phone} · `}
            <Link href="/admin/tutors" className="underline underline-offset-2">
              ← all tutors
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active students" value={month?.active_students ?? 0} emoji="⭐" tone="grass" />
        <StatCard label="Pending approval" value={month?.pending_students ?? 0} emoji="⏳" tone="sunshine" />
        <StatCard label="Lessons this month" value={month?.lessons_this_month ?? 0} emoji="🎓" tone="sky" />
        <StatCard
          label="Expected commission"
          value={fmtCents(expected)}
          hint={`${fmtCents(rate)}/lesson · only you see this`}
          emoji="🤫"
          tone="lilac"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <TutorAdminPanel
            tutorId={id}
            bio={tutor.bio}
            meetingUrl={tutor.meeting_url ?? ""}
            active={tutor.active}
            rateCents={rate}
            allSubjects={subjects ?? []}
            subjectIds={(tutorSubjects ?? []).map((s) => s.subject_id)}
          />

          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold text-lg">Their students 🎒</h2>
            {roster?.length ? (
              <ul className="space-y-2">
                {roster.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/tutor/students/${s.id}`}
                      className="squash flex items-center gap-2 rounded-2xl border-2 border-line bg-paper px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">
                        {s.full_name} <span className="font-normal text-ink-soft">· {s.grade}</span>
                      </span>
                      {s.wants_assessment && <Chip tone="grass">✨ assessment</Chip>}
                      <Chip
                        tone={
                          s.assignment_status === "active"
                            ? "grass"
                            : s.assignment_status === "pending_tutor"
                              ? "sunshine"
                              : "coral"
                        }
                      >
                        {s.assignment_status.replace("_", " ")}
                      </Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No students yet" hint="Assign someone from the People tab." />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold text-lg">Recent activity 📋</h2>
            {recentLessons?.length ? (
              <ul className="space-y-1.5 text-sm">
                {recentLessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 rounded-xl bg-cream px-3 py-1.5">
                    <span className="flex-1 truncate">
                      {(l.subjects as unknown as { emoji: string } | null)?.emoji ?? "📘"}{" "}
                      {(l.students as unknown as { full_name: string } | null)?.full_name} ·{" "}
                      {fmtDate(l.scheduled_at, true)}
                    </span>
                    <Chip tone={l.status === "completed" ? "grass" : l.status === "scheduled" ? "sky" : "coral"}>
                      {l.status}
                    </Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">No lessons yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {id !== me.id ? (
            <div>
              <h2 className="mb-3 font-display font-bold text-lg">Notes & messages 💬</h2>
              <ChatThread
                meId={me.id}
                otherId={id}
                otherName={person?.full_name || "Tutor"}
                messages={(chat ?? []) as ChatMessage[]}
              />
            </div>
          ) : (
            <Card className="bg-pastel-purple p-5">
              <p className="font-display font-bold">👑 This is your own tutor space</p>
              <p className="mt-1 text-sm text-ink-soft">
                Students you assign to yourself activate instantly and show up in{" "}
                <Link href="/tutor" className="font-bold underline">your Tutor HQ</Link> with all
                the same tools every tutor gets.
              </p>
            </Card>
          )}

          <div>
            <h2 className="mb-3 font-display font-bold text-lg">Their availability 🗓️</h2>
            <AvailabilityEditor slots={slots ?? []} tutorId={id} />
          </div>
        </div>
      </div>
    </>
  );
}
