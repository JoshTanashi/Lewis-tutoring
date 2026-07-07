// PayFast ITN (Instant Transaction Notification) webhook.
// Public endpoint by design — PayFast servers POST here without a JWT; we
// authenticate the payload itself (signature + server postback + amount check).
// EVERY notification is stored raw BEFORE any processing: the ledger never lies.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto as stdCrypto } from "jsr:@std/crypto@1";
import { encodeHex } from "jsr:@std/encoding@1/hex";

const MODE = Deno.env.get("PAYFAST_MODE") ?? "sandbox";
const PASSPHRASE = Deno.env.get("PAYFAST_PASSPHRASE") ?? (MODE === "sandbox" ? "jt7NOE43FZPn" : "");
const PF_HOST = MODE === "live" ? "www.payfast.co.za" : "sandbox.payfast.co.za";

function pfEncode(value: string): string {
  // PayFast expects PHP-style urlencode: spaces as '+', uppercase hex
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

async function md5Hex(s: string): Promise<string> {
  const digest = await stdCrypto.subtle.digest("MD5", new TextEncoder().encode(s));
  return encodeHex(digest);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("ok");

  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);
  const data: Record<string, string> = {};
  for (const [k, v] of params) data[k] = v;

  const sourceIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 1. Log the raw notification first, no matter what.
  const invoiceId = data.m_payment_id || null;
  const toCents = (v?: string) => (v ? Math.round(parseFloat(v) * 100) : null);
  const { data: paymentRow, error: logErr } = await admin
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      provider: "payfast",
      pf_payment_id: data.pf_payment_id ?? null,
      merchant_payment_id: invoiceId,
      amount_gross_cents: toCents(data.amount_gross),
      amount_fee_cents: toCents(data.amount_fee),
      amount_net_cents: toCents(data.amount_net),
      status: "received",
      source_ip: sourceIp,
      raw_itn: data,
    })
    .select("id")
    .single();
  if (logErr) console.error("failed to log ITN", logErr);

  const setStatus = async (status: string, signatureValid?: boolean) => {
    if (!paymentRow) return;
    await admin
      .from("payments")
      .update({ status, ...(signatureValid === undefined ? {} : { signature_valid: signatureValid }) })
      .eq("id", paymentRow.id);
  };

  try {
    // 2. Signature check — fields in received order, minus signature.
    const pairs: string[] = [];
    for (const [k, v] of params) {
      if (k === "signature") continue;
      pairs.push(`${k}=${pfEncode(v)}`);
    }
    let sigString = pairs.join("&");
    if (PASSPHRASE) sigString += `&passphrase=${pfEncode(PASSPHRASE)}`;
    const expected = await md5Hex(sigString);
    const signatureValid = expected === (data.signature ?? "").toLowerCase();

    if (!signatureValid) {
      await setStatus("invalid_signature", false);
      return new Response("ok"); // always 200 so PayFast stops retrying
    }

    // 3. Server-to-server confirmation postback.
    const validateRes = await fetch(`https://${PF_HOST}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: pairs.join("&"),
    });
    const validateText = (await validateRes.text()).trim();
    if (!validateText.startsWith("VALID")) {
      await setStatus("failed_postback", true);
      return new Response("ok");
    }

    if (data.payment_status !== "COMPLETE") {
      await setStatus(`pf_${(data.payment_status ?? "unknown").toLowerCase()}`, true);
      return new Response("ok");
    }

    // 4. Amount must match the invoice to the cent.
    if (!invoiceId) {
      await setStatus("no_invoice_ref", true);
      return new Response("ok");
    }
    const { data: invoice } = await admin
      .from("invoices")
      .select("id, amount_cents, status")
      .eq("id", invoiceId)
      .single();
    if (!invoice) {
      await setStatus("unknown_invoice", true);
      return new Response("ok");
    }
    const gross = toCents(data.amount_gross) ?? -1;
    if (gross !== invoice.amount_cents) {
      await setStatus("amount_mismatch", true);
      return new Response("ok");
    }

    // 5. All checks passed — mark paid (idempotent).
    if (invoice.status !== "paid") {
      await admin
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", invoice.id);
    }
    await setStatus("complete", true);
    return new Response("ok");
  } catch (err) {
    console.error("ITN processing error", err);
    await setStatus("error");
    return new Response("ok");
  }
});
