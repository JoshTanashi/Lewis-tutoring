"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/roles";
import { createServerSupabase } from "@/lib/supabase/server";

/** Super admin changes a user's role (DB trigger enforces who may do this). */
export async function setUserRole(userId: string, role: Role) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  // becoming staff means being assignable — make sure the tutor profile exists
  if (!error && (role === "tutor" || role === "super_admin")) {
    await supabase.from("tutor_profiles").upsert({ user_id: userId }, { onConflict: "user_id" });
  }
  revalidatePath("/admin/settings");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/** Super admin edits package pricing (staff-only RLS on packages). */
export async function setPackagePrice(slug: string, priceCents: number) {
  const supabase = await createServerSupabase();
  const { data: pkg } = await supabase
    .from("packages")
    .select("lessons_per_month, price_cents")
    .eq("slug", slug)
    .single();
  if (!pkg) return { ok: false as const, error: "Unknown package" };
  const perLesson = Math.round(priceCents / pkg.lessons_per_month);
  const { error } = await supabase
    .from("packages")
    .update({ price_cents: priceCents, per_lesson_cents: perLesson })
    .eq("slug", slug);
  revalidatePath("/admin/settings");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/** Assign (or hand over) a student to a tutor — assigning to yourself activates instantly. */
export async function assignStudent(studentId: string, tutorId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("assign_student", {
    p_student: studentId,
    p_tutor: tutorId,
  });
  revalidatePath("/admin/people");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/** The nuclear option — only the super admin can permanently delete. */
export async function deleteStudentForever(studentId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("students").delete().eq("id", studentId);
  revalidatePath("/admin/people");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/** Per-tutor commission (super-admin-only table; default R100/lesson). */
export async function setCommission(tutorId: string, centsPerLesson: number) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("tutor_commissions")
    .upsert({ tutor_id: tutorId, cents_per_lesson: Math.max(0, Math.round(centsPerLesson)), updated_at: new Date().toISOString() });
  revalidatePath(`/admin/tutors/${tutorId}`);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function updateTutorProfile(tutorId: string, patch: { bio?: string; meeting_url?: string; active?: boolean }) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("tutor_profiles").update(patch).eq("user_id", tutorId);
  revalidatePath(`/admin/tutors/${tutorId}`);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function setTutorSubjects(tutorId: string, subjectIds: number[]) {
  const supabase = await createServerSupabase();
  await supabase.from("tutor_subjects").delete().eq("tutor_id", tutorId);
  if (subjectIds.length) {
    const { error } = await supabase
      .from("tutor_subjects")
      .insert(subjectIds.map((subject_id) => ({ tutor_id: tutorId, subject_id })));
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath(`/admin/tutors/${tutorId}`);
  return { ok: true as const };
}

export async function updateApplication(
  id: string,
  patch: { status?: "new" | "interview" | "approved" | "rejected"; interview_at?: string | null; admin_notes?: string },
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("tutor_applications").update(patch).eq("id", id);
  revalidatePath("/admin/applications");
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
