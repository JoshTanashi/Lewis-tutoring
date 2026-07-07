"use server";

import { createServerSupabase } from "@/lib/supabase/server";

/** Adds an email to the video-lessons waitlist (SECURITY DEFINER RPC, anon-safe). */
export async function joinWaitlist(email: string): Promise<{ ok: boolean }> {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false };
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.rpc("join_waitlist", { p_email: clean });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error("waitlist signup failed", err);
    return { ok: false };
  }
}
