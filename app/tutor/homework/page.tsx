import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { ReviewQueue } from "./review-queue";

export const metadata = { title: "Homework centre" };

export default async function TutorHomeworkPage() {
  const supabase = await createServerSupabase();
  const { data: submitted } = await supabase
    .from("homework")
    .select(
      "id, title, due_date, students(full_name), subjects(name, emoji), homework_submissions(id, content, submitted_at)",
    )
    .eq("status", "submitted")
    .order("created_at", { ascending: false });

  const items = (submitted ?? [])
    .map((h) => {
      const sub = Array.isArray(h.homework_submissions)
        ? h.homework_submissions[0]
        : h.homework_submissions;
      if (!sub) return null;
      return {
        homework_id: h.id,
        submission_id: (sub as { id: string }).id,
        title: h.title,
        student: (h.students as unknown as { full_name: string } | null)?.full_name ?? "",
        subject: h.subjects as unknown as { name: string; emoji: string } | null,
        content: (sub as { content: string | null }).content,
        submitted_at: (sub as { submitted_at: string }).submitted_at,
      };
    })
    .filter(Boolean) as {
    homework_id: string;
    submission_id: string;
    title: string;
    student: string;
    subject: { name: string; emoji: string } | null;
    content: string | null;
    submitted_at: string;
  }[];

  return (
    <>
      <PageTitle title="Homework centre 📚" sub="Fresh hand-ins waiting for your gold stars." />
      {items.length ? (
        <ReviewQueue items={items} />
      ) : (
        <EmptyState title="All caught up!" hint="New hand-ins will pop up here the moment kids submit." />
      )}
    </>
  );
}
