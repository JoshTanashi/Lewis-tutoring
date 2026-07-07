import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { InvoiceList } from "./invoice-list";

export const metadata = { title: "Invoices" };

export default async function BillingPage() {
  const supabase = await createServerSupabase();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, description, amount_cents, status, issued_at, due_at, paid_at")
    .order("issued_at", { ascending: false });

  return (
    <>
      <PageTitle
        title="Invoices 🧾"
        sub="Every payment, neatly on record. Paid ones can be printed for safekeeping."
      />
      <InvoiceList invoices={invoices ?? []} />
    </>
  );
}
