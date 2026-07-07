import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { HomeworkList } from "./homework-list";

export const metadata = { title: "Homework" };

export default async function StudentHomeworkPage() {
  const supabase = await createServerSupabase();
  const profile = (await getProfile())!;
  const { data: me } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", profile.id)
    .maybeSingle();

  if (!me) {
    return <EmptyState title="No homework space found" hint="Ask a grown-up to help!" />;
  }

  const { data: homework } = await supabase
    .from("homework")
    .select(
      "id, title, instructions, due_date, status, resource_url, subjects(name, emoji), homework_submissions(grade, feedback, reviewed_at)",
    )
    .eq("student_id", me.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <>
      <PageTitle title="Homework HQ 📚" sub="Hand things in here — Miss Lewis gets them instantly!" />
      <HomeworkList
        items={(homework ?? []).map((h) => ({
          id: h.id,
          title: h.title,
          instructions: h.instructions,
          due_date: h.due_date,
          status: h.status,
          resource_url: h.resource_url,
          subject: h.subjects as unknown as { name: string; emoji: string } | null,
          submission: (Array.isArray(h.homework_submissions)
            ? h.homework_submissions[0]
            : h.homework_submissions) as { grade: number | null; feedback: string | null; reviewed_at: string | null } | null,
        }))}
      />
    </>
  );
}
