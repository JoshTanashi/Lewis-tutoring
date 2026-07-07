"use server";

import { buildCheckout, type PayfastCheckout } from "@/lib/payfast";
import { createServerSupabase } from "@/lib/supabase/server";

/** Restart payment for an existing pending invoice (RLS: parents see only their own). */
export async function payInvoice(
  invoiceId: string,
): Promise<{ ok: true; checkout: PayfastCheckout } | { ok: false; error: string }> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, description, amount_cents, status")
    .eq("id", invoiceId)
    .single();
  if (!invoice) return { ok: false, error: "Invoice not found." };
  if (invoice.status !== "pending") return { ok: false, error: "This invoice isn't payable." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return {
    ok: true,
    checkout: buildCheckout({
      invoiceId: invoice.id,
      amountCents: invoice.amount_cents,
      itemName: invoice.description,
      buyerFirstName: profile?.full_name?.split(" ")[0] || "Parent",
      buyerEmail: user.email ?? "",
    }),
  };
}
