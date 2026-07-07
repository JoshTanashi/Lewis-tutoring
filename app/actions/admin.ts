"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/roles";
import { createServerSupabase } from "@/lib/supabase/server";

/** Super admin changes a user's role (DB trigger enforces who may do this). */
export async function setUserRole(userId: string, role: Role) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
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
