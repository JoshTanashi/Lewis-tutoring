// Account creation with auto-confirmed email (no SMTP dependency).
// Public endpoint by design — equivalent to Supabase's own /signup, but it
// creates the user pre-confirmed so families can pay & sign in immediately.
// self_student=true lets older learners register for themselves (the DB
// trigger maps it to the low-privilege 'student' role — staff roles can
// never be chosen from the client).
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors });
  }
  try {
    const { email, password, full_name, phone, self_student } = await req.json();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email address.");
    if (cleanEmail.endsWith("@kids.lewistutoring.co.za")) throw new Error("That email domain is reserved.");
    if (typeof password !== "string" || password.length < 8) throw new Error("Password must be at least 8 characters.");
    if (typeof full_name !== "string" || full_name.trim().length < 2) throw new Error("Please tell us your name.");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        phone: phone ?? null,
        self_student: self_student === true ? "true" : "false",
      },
    });
    if (error) {
      const msg = /already/i.test(error.message)
        ? "Looks like you already have an account — try signing in!"
        : error.message;
      throw new Error(msg);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
