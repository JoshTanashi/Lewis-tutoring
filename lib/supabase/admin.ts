import { createClient } from "@supabase/supabase-js";

/** Service-role client — server only. Bypasses RLS; use sparingly and deliberately
 *  (webhooks, waitlist, kid-login lookup). Never import from client components. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are not configured");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
