import type { Notice } from "@/components/portal/bell";
import { createServerSupabase } from "@/lib/supabase/server";

/** Latest notifications for the signed-in user (for the portal bell). */
export async function getNotices(): Promise<Notice[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, href, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as Notice[];
}
