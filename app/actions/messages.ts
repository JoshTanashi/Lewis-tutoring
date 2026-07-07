"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function sendMessage(recipientId: string, body: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in again." };
  const text = body.trim();
  if (!text) return { ok: false as const, error: "Write a little something first!" };
  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body: text.slice(0, 2000) });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function markThreadRead(otherId: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("sender_id", otherId)
    .is("read_at", null);
}
