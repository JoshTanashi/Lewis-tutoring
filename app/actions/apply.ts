"use server";

import { createServerSupabase } from "@/lib/supabase/server";

/** Public tutor application — validated & rate-limited inside the RPC. */
export async function applyToTutor(input: {
  full_name: string;
  email: string;
  phone?: string;
  subjects: string;
  experience: string;
  motivation: string;
}) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("apply_to_tutor", {
    p_full_name: input.full_name,
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_subjects: input.subjects,
    p_experience: input.experience,
    p_motivation: input.motivation,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
