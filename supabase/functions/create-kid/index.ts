// Creates a kid login (username + 6-digit PIN) for a student.
// Caller must be the student's parent (or staff). The kid gets a synthetic
// auth user <username>@kids.lewistutoring.co.za whose password is the PIN.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KID_DOMAIN = "kids.lewistutoring.co.za";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: caller, error: authErr } = await admin.auth.getUser(jwt);
    if (authErr || !caller?.user) throw new Error("Please sign in again.");

    const { student_id, username, pin } = await req.json();
    const cleanUsername = String(username ?? "").trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{2,19}$/.test(cleanUsername)) {
      throw new Error("Username must be 3–20 letters, numbers, dots or dashes.");
    }
    if (!/^\d{6}$/.test(String(pin ?? ""))) throw new Error("PIN must be exactly 6 digits.");

    // caller must own the student, or be staff
    const { data: student, error: stuErr } = await admin
      .from("students")
      .select("id, parent_id, full_name, auth_user_id")
      .eq("id", student_id)
      .single();
    if (stuErr || !student) throw new Error("We couldn't find that student.");

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .single();
    const isStaff = callerProfile?.role === "tutor" || callerProfile?.role === "super_admin";
    if (student.parent_id !== caller.user.id && !isStaff) {
      throw new Error("Only this child's parent can create their login.");
    }
    if (student.auth_user_id) throw new Error("This child already has a login — you can reset the PIN instead.");

    const email = `${cleanUsername}@${KID_DOMAIN}`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: String(pin),
      email_confirm: true,
      user_metadata: { full_name: student.full_name, kid: true },
    });
    if (createErr) {
      const msg = /already/i.test(createErr.message)
        ? "That username is taken — try another one!"
        : createErr.message;
      throw new Error(msg);
    }

    const { error: linkErr } = await admin
      .from("students")
      .update({ auth_user_id: created.user.id, username: cleanUsername })
      .eq("id", student.id);
    if (linkErr) {
      // roll back the orphaned auth user so retries work
      await admin.auth.admin.deleteUser(created.user.id);
      throw new Error("Could not link the login — is that username already used?");
    }

    return new Response(JSON.stringify({ ok: true, username: cleanUsername }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
