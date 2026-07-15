"use server";

import { buildCheckout, type PayfastCheckout } from "@/lib/payfast";
import { createServerSupabase } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/*  Onboarding v2: the wizard is public; the account is created by the */
/*  client right before payment, then this action does everything else */
/*  in one go — student, subjects, lessons, invoice, PayFast form.     */
/* ------------------------------------------------------------------ */

export type OnboardingPayload = {
  who: "parent" | "self";
  parent: { full_name: string; phone?: string };
  child: {
    full_name: string;
    grade: string;
    age_band: "young" | "teen";
    mascot: string;
    subject_ids: number[];
    other_subjects?: string;
    goals?: string;
    care_notes?: string;
  };
  package_slug: string;
  slots: { slot_at: string; tutor_id: string | null }[];
};

export type CheckoutResult =
  | { ok: true; checkout: PayfastCheckout; invoiceNumber: string }
  | { ok: false; error: string };

export async function completeOnboarding(payload: OnboardingPayload): Promise<CheckoutResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired — please sign in and try again." };

  // freshen profile details collected during onboarding (asked exactly once)
  await supabase
    .from("profiles")
    .update({
      full_name: payload.parent.full_name.trim(),
      phone: payload.parent.phone?.trim() || null,
    })
    .eq("id", user.id);

  // ---- student (idempotent: reuse an identical child from a retried run) ----
  const childName = payload.child.full_name.trim();
  let studentId: string | null = null;
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("parent_id", user.id)
    .eq("full_name", childName)
    .maybeSingle();
  if (existing) {
    studentId = existing.id;
  } else {
    const { data: created, error: stuErr } = await supabase
      .from("students")
      .insert({
        parent_id: user.id,
        auth_user_id: payload.who === "self" ? user.id : null,
        is_self: payload.who === "self",
        full_name: childName,
        grade: payload.child.grade,
        age_band: payload.child.age_band,
        mascot: payload.child.mascot,
        goals: payload.child.goals?.trim() || null,
        medical_notes: payload.child.care_notes?.trim() || null,
        other_subjects: payload.child.other_subjects?.trim() || null,
      })
      .select("id")
      .single();
    if (stuErr || !created) return { ok: false, error: stuErr?.message ?? "Could not save the student." };
    studentId = created.id;

    if (payload.child.subject_ids.length) {
      const { error: enrolErr } = await supabase
        .from("enrollments")
        .insert(payload.child.subject_ids.map((subject_id) => ({ student_id: studentId, subject_id })));
      if (enrolErr) return { ok: false, error: enrolErr.message };
    }

    // ---- book the chosen slots (count enforced by the wizard per package) ----
    if (payload.slots.length) {
      const { error: lessonErr } = await supabase.from("lessons").insert(
        payload.slots.map((s) => ({
          student_id: studentId,
          subject_id: payload.child.subject_ids[0] ?? null,
          scheduled_at: s.slot_at,
          tutor_id: s.tutor_id,
          mode: "online" as const,
          status: "scheduled" as const,
          created_by: user.id,
        })),
      );
      if (lessonErr) return { ok: false, error: lessonErr.message };
    }
  }

  // ---- invoice (server-priced; RPC reuses a pending twin => no double payments) ----
  const { data: invoice, error: invErr } = await supabase.rpc("create_invoice_for_package", {
    p_package_slug: payload.package_slug,
    p_student_id: studentId,
  });
  if (invErr || !invoice) return { ok: false, error: invErr?.message ?? "Could not create the invoice." };

  const checkout = buildCheckout({
    invoiceId: invoice.id,
    amountCents: invoice.amount_cents,
    itemName: invoice.description,
    buyerFirstName: payload.parent.full_name.split(" ")[0] || "Parent",
    buyerEmail: user.email ?? "",
  });
  return { ok: true, checkout, invoiceNumber: invoice.number };
}

/* ---------------- still used by the parent portal ---------------- */

export async function bookLessons(input: {
  student_id: string;
  subject_id: number | null;
  slots: { slot_at: string; tutor_id: string | null }[];
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };
  if (!input.slots.length) return { ok: false as const, error: "Pick at least one time slot." };

  const { error } = await supabase.from("lessons").insert(
    input.slots.map((s) => ({
      student_id: input.student_id,
      subject_id: input.subject_id,
      scheduled_at: s.slot_at,
      tutor_id: s.tutor_id,
      mode: "online" as const,
      status: "scheduled" as const,
      created_by: user.id,
    })),
  );
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function startCheckout(input: {
  package_slug: string;
  student_id: string;
}): Promise<CheckoutResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: invoice, error } = await supabase.rpc("create_invoice_for_package", {
    p_package_slug: input.package_slug,
    p_student_id: input.student_id,
  });
  if (error || !invoice) return { ok: false, error: error?.message ?? "Could not create invoice" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return {
    ok: true,
    checkout: buildCheckout({
      invoiceId: invoice.id,
      amountCents: invoice.amount_cents,
      itemName: invoice.description,
      buyerFirstName: profile?.full_name?.split(" ")[0] || "Parent",
      buyerEmail: user.email ?? "",
    }),
    invoiceNumber: invoice.number,
  };
}

/** Adding another child from the parent portal. */
export async function addChild(input: {
  full_name: string;
  grade: string;
  subject_ids: number[];
  mascot: string;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };

  const ageBand = gradeToAgeBand(input.grade);
  const { data: student, error } = await supabase
    .from("students")
    .insert({
      parent_id: user.id,
      full_name: input.full_name.trim(),
      grade: input.grade,
      age_band: ageBand,
      mascot: input.mascot,
    })
    .select("id")
    .single();
  if (error || !student) return { ok: false as const, error: error?.message ?? "Could not save" };

  if (input.subject_ids.length) {
    const { error: enrolErr } = await supabase
      .from("enrollments")
      .insert(input.subject_ids.map((subject_id) => ({ student_id: student.id, subject_id })));
    if (enrolErr) return { ok: false as const, error: enrolErr.message };
  }
  return { ok: true as const, student_id: student.id };
}

function gradeToAgeBand(grade: string): "young" | "teen" {
  const match = grade.match(/Grade (\d+)/);
  if (!match) return "young"; // Grade R prep / Grade R
  return Number(match[1]) >= 6 ? "teen" : "young";
}
