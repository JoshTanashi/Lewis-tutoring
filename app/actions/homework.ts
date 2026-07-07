"use server";

import { createServerSupabase } from "@/lib/supabase/server";

/** Kid (or parent) hands in homework: creates the submission + flips status. */
export async function submitHomework(homeworkId: string, content: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };

  const { error: subErr } = await supabase
    .from("homework_submissions")
    .insert({ homework_id: homeworkId, content: content.trim().slice(0, 4000) || null });
  if (subErr) return { ok: false as const, error: subErr.message };

  const { error: statusErr } = await supabase
    .from("homework")
    .update({ status: "submitted" })
    .eq("id", homeworkId);
  if (statusErr) return { ok: false as const, error: statusErr.message };
  return { ok: true as const };
}
