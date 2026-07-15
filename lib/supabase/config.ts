/** Supabase connection details.
 *
 * Env vars win when set; otherwise we fall back to the project's public
 * values so a fresh deploy works with zero configuration. The anon key is
 * public by design — it's shipped to every browser and all access is
 * enforced by row-level security. (The service-role key is NEVER here.)
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://uatzbulkyoyuntghqcno.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHpidWxreW95dW50Z2hxY25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTA3NjksImV4cCI6MjA5ODkyNjc2OX0.Pxq2eHQO6C-02qCBq0DCEml78Euxuvsl1gXrel1eWnk";

/** Edge function endpoint (auth-signup, create-kid, payfast-itn). */
export function functionUrl(name: string): string {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}
