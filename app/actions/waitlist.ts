"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/** Adds an email to the video-lessons waitlist. */
export async function joinWaitlist(email: string): Promise<{ ok: boolean }> {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false };
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("waitlist")
      .upsert({ email: clean }, { onConflict: "email" });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error("waitlist signup failed", err);
    return { ok: false };
  }
}
