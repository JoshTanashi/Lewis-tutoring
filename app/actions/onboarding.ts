"use server";

import { buildCheckout, type PayfastCheckout } from "@/lib/payfast";
import { createServerSupabase } from "@/lib/supabase/server";

export type ChildInput = {
  full_name: string;
  grade: string;
  school?: string;
  birthdate?: string;
  mascot: string;
  subject_ids: number[];
  goals?: string;
  learning_style?: string;
  medical_notes?: string;
};

/** Step 1 — keep the parent's profile details fresh. */
export async function saveParentDetails(input: { full_name: string; phone?: string }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.full_name.trim(), phone: input.phone?.trim() || null })
    .eq("id", user.id);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/** Step 2 — add a child + their subjects. Returns the student id. */
export async function addChild(input: ChildInput) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      parent_id: user.id,
      full_name: input.full_name.trim(),
      grade: input.grade,
      school: input.school?.trim() || null,
      birthdate: input.birthdate || null,
      mascot: input.mascot,
      goals: input.goals?.trim() || null,
      learning_style: input.learning_style || null,
      medical_notes: input.medical_notes?.trim() || null,
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

/** Step 3 — book the first lesson in a chosen open slot. */
export async function bookFirstLesson(input: {
  student_id: string;
  subject_id: number | null;
  slot_at: string; // ISO
  mode: "online" | "in_person";
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };

  const { error } = await supabase.from("lessons").insert({
    student_id: input.student_id,
    subject_id: input.subject_id,
    scheduled_at: input.slot_at,
    mode: input.mode,
    status: "scheduled",
    created_by: user.id,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

/** Step 5→6 — create the invoice (server-priced) and the signed PayFast form. */
export async function startCheckout(input: {
  package_slug: string;
  student_id: string;
}): Promise<{ ok: true; checkout: PayfastCheckout; invoiceNumber: string } | { ok: false; error: string }> {
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

  const checkout = buildCheckout({
    invoiceId: invoice.id,
    amountCents: invoice.amount_cents,
    itemName: invoice.description,
    buyerFirstName: profile?.full_name?.split(" ")[0] || "Parent",
    buyerEmail: user.email ?? "",
  });
  return { ok: true, checkout, invoiceNumber: invoice.number };
}
