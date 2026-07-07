import { createHash } from "crypto";

/** PayFast checkout helper — builds the signed form POSTed to PayFast.
 *  Sandbox by default; set PAYFAST_MODE=live + real credentials to go live. */

const MODE = process.env.PAYFAST_MODE ?? "sandbox";

export const PAYFAST_PROCESS_URL =
  MODE === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";

function creds() {
  return {
    merchant_id: process.env.PAYFAST_MERCHANT_ID ?? "10000100",
    merchant_key: process.env.PAYFAST_MERCHANT_KEY ?? "46f0cd694581a",
    passphrase: process.env.PAYFAST_PASSPHRASE ?? (MODE === "sandbox" ? "jt7NOE43FZPn" : ""),
  };
}

/** PHP-style urlencode: spaces become '+', hex escapes uppercase. */
function pfEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

export type PayfastCheckout = {
  processUrl: string;
  /** Ordered fields to render as hidden inputs, signature included. */
  fields: Array<[string, string]>;
};

export function buildCheckout(input: {
  invoiceId: string;
  amountCents: number;
  itemName: string;
  buyerFirstName: string;
  buyerEmail: string;
}): PayfastCheckout {
  const { merchant_id, merchant_key, passphrase } = creds();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const notifyBase = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Field order matters for the signature — keep PayFast's documented order.
  const fields: Array<[string, string]> = [
    ["merchant_id", merchant_id],
    ["merchant_key", merchant_key],
    ["return_url", `${site}/onboarding/success`],
    ["cancel_url", `${site}/onboarding/cancelled`],
    ["notify_url", `${notifyBase}/functions/v1/payfast-itn`],
    ["name_first", input.buyerFirstName.slice(0, 100)],
    ["email_address", input.buyerEmail],
    ["m_payment_id", input.invoiceId],
    ["amount", (input.amountCents / 100).toFixed(2)],
    ["item_name", input.itemName.slice(0, 100)],
  ];

  let sigString = fields.map(([k, v]) => `${k}=${pfEncode(v)}`).join("&");
  if (passphrase) sigString += `&passphrase=${pfEncode(passphrase)}`;
  const signature = createHash("md5").update(sigString).digest("hex");
  fields.push(["signature", signature]);

  return { processUrl: PAYFAST_PROCESS_URL, fields };
}
