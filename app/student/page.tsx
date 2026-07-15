import Link from "next/link";
import {
  BlobPal,
  CloudPal,
  HeartPal,
  PencilPal,
  RainbowArc,
  StarPal,
} from "@/components/brand/mascots";
import { EmptyState, StatCard, fmtDate } from "@/components/portal/widgets";
import { ButtonLink, Card, Chip, RainbowProgress } from "@/components/ui";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { Countdown } from "./countdown";

export const metadata = { title: "My Space" };

function mascotEl(slug: string, size = 74) {
  switch (slug) {
    case "heart":
      return <HeartPal size={size} mood="excited" />;
    case "pencil":
      return <PencilPal size={size} mood="excited" />;
    case "cloud":
      return <CloudPal size={size} mood="excited" />;
    case "blob-green":
      return <BlobPal size={size} color="var(--color-grass)" mood="excited" />;
    case "blob-lilac":
      return <BlobPal size={size} color="var(--color-lilac)" mood="excited" />;
    default:
      return <StarPal size={size} mood="excited" />;
  }
}

export default async function StudentDashboard() {
  const supabase = await createServerSupabase();
  const profile = (await getProfile())!;

  const { data: me } = await supabase
    .from("students")
    .select("id, full_name, mascot, confidence_score, grade, age_band")
    .eq("auth_user_id", profile.id)
    .maybeSingle();

  if (!me) {
    return (
      <EmptyState
        title="Hmm, we can't find your space!"
        hint="Ask a grown-up to check your login with Miss Lewis."
      />
    );
  }

  const [{ data: nextLesson }, { data: homework }, { data: badges }, { data: streak }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("scheduled_at, mode, meeting_url, subjects(name, emoji)")
        .eq("student_id", me.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("homework")
        .select("id, title, due_date, status, subjects(name, emoji)")
        .eq("student_id", me.id)
        .neq("status", "reviewed")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(4),
      supabase
        .from("student_badges")
        .select("badges(name, emoji)")
        .eq("student_id", me.id)
        .order("awarded_at", { ascending: false })
        .limit(6),
      supabase.from("streaks").select("current_weeks").eq("student_id", me.id).maybeSingle(),
    ]);

  const firstName = me.full_name.split(" ")[0];
  const todo = (homework ?? []).filter((h) => h.status === "assigned");
  const teen = me.age_band === "teen";

  return (
    <div className="space-y-6">
      {/* welcome banner — the buddy greets young learners, teens get a calmer hello */}
      <Card sticker={!teen} className={`relative overflow-hidden p-6 ${teen ? "bg-pastel-blue" : "bg-pastel-yellow"}`}>
        <RainbowArc size={160} className="absolute -right-6 -top-8 opacity-60" />
        <div className="flex items-center gap-4">
          <div className={teen ? "animate-float" : "animate-bounce-soft"}>
            {mascotEl(me.mascot, teen ? 54 : 74)}
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl">
              {teen ? `Hey ${firstName} 👋` : `Hi ${firstName}! ⭐`}
            </h1>
            <p className="text-sm font-bold text-ink-soft">
              {teen
                ? todo.length
                  ? `${todo.length} task${todo.length > 1 ? "s" : ""} on your list — let's knock them out.`
                  : "All caught up. Nicely done. 😎"
                : todo.length
                  ? `You have ${todo.length} mission${todo.length > 1 ? "s" : ""} today — you've got this!`
                  : "All missions done — you're a legend! 🎉"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card sticker={!teen} className="bg-pastel-pink p-4">
          <p className="text-xs font-extrabold uppercase text-ink-soft">⏰ Next lesson</p>
          {nextLesson ? (
            <>
              <p className="mt-1 font-display font-bold text-lg leading-tight">
                {(nextLesson.subjects as unknown as { emoji: string; name: string } | null)?.emoji}{" "}
                {(nextLesson.subjects as unknown as { name: string } | null)?.name ?? "Lesson"}
              </p>
              <Countdown to={nextLesson.scheduled_at} />
              {nextLesson.meeting_url && (
                <a
                  href={nextLesson.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="squash mt-2 inline-block rounded-full bg-grass px-3.5 py-1.5 font-display text-xs font-bold text-white"
                >
                  💻 Join my lesson!
                </a>
              )}
            </>
          ) : (
            <p className="mt-1 font-display font-bold">None booked yet!</p>
          )}
        </Card>
        <StatCard sticker={!teen} label="Streak" value={`${streak?.current_weeks ?? 0} weeks`} emoji="🔥" tone="sunshine" hint="lessons in a row!" />
        <StatCard sticker={!teen} label="Badges" value={badges?.length ?? 0} emoji="🏅" tone="lilac" hint="on your shelf" />
        <Card sticker={!teen} className="bg-pastel-green p-4">
          <p className="text-xs font-extrabold uppercase text-ink-soft">🌱 Confidence power</p>
          <RainbowProgress value={me.confidence_score} className="mt-2.5" label="confidence" />
          <p className="mt-1.5 font-display font-bold text-sm">{me.confidence_score}% and growing!</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* today's missions */}
        <Card sticker={!teen} className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">{teen ? "Up next 📋" : "Today’s missions 🚀"}</h2>
            <ButtonLink href="/student/homework" size="sm" variant="outline">
              All homework
            </ButtonLink>
          </div>
          {homework?.length ? (
            <ul className="space-y-2.5">
              {homework.map((h) => (
                <li key={h.id}>
                  <Link
                    href="/student/homework"
                    className="squash flex items-center gap-3 rounded-2xl border-2 border-navy bg-paper p-3"
                  >
                    <span className="text-2xl">
                      {(h.subjects as unknown as { emoji: string } | null)?.emoji ?? "📘"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold text-sm">{h.title}</p>
                      {h.due_date && (
                        <p className="text-xs font-bold text-ink-soft">due {fmtDate(h.due_date)}</p>
                      )}
                    </div>
                    <Chip tone={h.status === "submitted" ? "sky" : "sunshine"}>
                      {h.status === "submitted" ? "✔ handed in" : "to do"}
                    </Chip>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No missions right now!" hint="Enjoy the free time, champion. 🏖️" color="var(--color-sunshine)" />
          )}
        </Card>

        {/* badge shelf */}
        <Card sticker={!teen} className="p-5">
          <h2 className="mb-3 font-display font-bold text-xl">My badge shelf 🏅</h2>
          {badges?.length ? (
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b, i) => {
                const badge = b.badges as unknown as { name: string; emoji: string };
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 rounded-2xl border-2 border-navy bg-pastel-yellow p-3 text-center"
                  >
                    <span className="text-3xl">{badge.emoji}</span>
                    <span className="text-[10px] font-extrabold leading-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Your shelf is waiting!"
              hint="Finish lessons and homework to earn shiny badges."
              color="var(--color-sunshine)"
            />
          )}
          <div className="mt-4 text-center">
            <ButtonLink href="/student/journey" variant="sunshine">
              See my whole journey 🌈
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
