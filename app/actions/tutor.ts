"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

/* All of these run under the caller's session — RLS only lets staff through. */

export async function completeLesson(input: {
  lesson_id: string;
  student_id: string;
  attendance: "present" | "late" | "absent";
  summary?: string;
}) {
  const supabase = await createServerSupabase();
  const status = input.attendance === "absent" ? "no_show" : "completed";
  const { error } = await supabase
    .from("lessons")
    .update({ status, summary: input.summary?.trim() || null })
    .eq("id", input.lesson_id);
  if (error) return { ok: false as const, error: error.message };

  const { error: attErr } = await supabase.from("attendance").upsert({
    lesson_id: input.lesson_id,
    student_id: input.student_id,
    status: input.attendance,
  });
  if (attErr) return { ok: false as const, error: attErr.message };
  revalidatePath("/tutor");
  return { ok: true as const };
}

export async function cancelLesson(lessonId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("lessons")
    .update({ status: "cancelled" })
    .eq("id", lessonId);
  revalidatePath("/tutor");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function assignHomework(input: {
  student_id: string;
  subject_id: number | null;
  title: string;
  instructions?: string;
  due_date?: string;
  resource_url?: string;
}) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("homework").insert({
    student_id: input.student_id,
    subject_id: input.subject_id,
    title: input.title.trim(),
    instructions: input.instructions?.trim() || null,
    due_date: input.due_date || null,
    resource_url: input.resource_url?.trim() || null,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function reviewSubmission(input: {
  submission_id: string;
  homework_id: string;
  grade: number | null;
  feedback?: string;
}) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("homework_submissions")
    .update({
      grade: input.grade,
      feedback: input.feedback?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.submission_id);
  if (error) return { ok: false as const, error: error.message };
  await supabase.from("homework").update({ status: "reviewed" }).eq("id", input.homework_id);
  revalidatePath("/tutor/homework");
  return { ok: true as const };
}

export async function recordAssessment(input: {
  student_id: string;
  subject_id: number | null;
  title: string;
  score: number;
  max_score: number;
  notes?: string;
}) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("assessments").insert({
    student_id: input.student_id,
    subject_id: input.subject_id,
    title: input.title.trim(),
    score: input.score,
    max_score: input.max_score || 100,
    notes: input.notes?.trim() || null,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function awardBadge(student_id: string, badge_id: number) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("student_badges").insert({ student_id, badge_id });
  return error
    ? { ok: false as const, error: /duplicate/i.test(error.message) ? "Already earned that one!" : error.message }
    : { ok: true as const };
}

export async function addTutorNote(student_id: string, note: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("journey_events").insert({
    student_id,
    type: "tutor_note",
    title: "A note from Miss Lewis",
    detail: note.trim(),
    emoji: "💬",
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function setConfidence(student_id: string, score: number) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("students")
    .update({ confidence_score: Math.max(0, Math.min(100, Math.round(score))) })
    .eq("id", student_id);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function toggleSlot(slot_id: string, active: boolean) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("availability_slots").update({ active }).eq("id", slot_id);
  revalidatePath("/tutor/availability");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function addSlot(weekday: number, start_time: string, mode: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("availability_slots")
    .insert({ weekday, start_time, mode });
  revalidatePath("/tutor/availability");
  return error
    ? { ok: false as const, error: /duplicate/i.test(error.message) ? "That slot already exists." : error.message }
    : { ok: true as const };
}
