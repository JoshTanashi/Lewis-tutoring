import { InvoiceList } from "@/app/parent/billing/invoice-list";
import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Billing" };

/** Self-signed-up students see and pay their own invoices. */
export default async function StudentBillingPage() {
  const supabase = await createServerSupabase();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, description, amount_cents, status, issued_at, due_at, paid_at")
    .order("issued_at", { ascending: false });

  return (
    <>
      <PageTitle title="Billing 🧾" sub="Your invoices — pay securely via PayFast." />
      <InvoiceList invoices={invoices ?? []} basePath="/student/billing" />
    </>
  );
}
