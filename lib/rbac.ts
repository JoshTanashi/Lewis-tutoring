import { redirect } from "next/navigation";
import { homePathFor, type Role } from "@/lib/roles";
import { createServerSupabase } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  role: Role;
  full_name: string;
  phone: string | null;
  avatar: string;
  email?: string;
};

/** Current user's profile, or null when signed out. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, avatar")
    .eq("id", user.id)
    .single();
  if (!data) return null;
  return { ...data, email: user.email } as Profile;
}

/** Gate a portal layout to specific roles; redirects instead of erroring. */
export async function requireRole(allowed: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!allowed.includes(profile.role)) redirect(homePathFor(profile.role));
  return profile;
}
