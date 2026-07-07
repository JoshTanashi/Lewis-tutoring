import { notFound } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { fmtCents } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { PrintButton } from "./print-button";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id, number, description, amount_cents, status, issued_at, paid_at, profiles!invoices_parent_id_fkey(full_name), students(full_name)",
    )
    .eq("id", id)
    .single();
  if (!invoice) notFound();

  const parent = invoice.profiles as unknown as { full_name: string } | null;
  const student = invoice.students as unknown as { full_name: string } | null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="card-pop p-8 print:border-0 print:shadow-none">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={54} />
            <div>
              <p className="font-display font-bold text-xl">Lewis Tutoring</p>
              <p className="text-xs text-ink-soft">
                Building confident learners, one lesson at a time.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-lg">{invoice.number}</p>
            <p className="text-xs text-ink-soft">
              {new Date(invoice.issued_at).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-pastel-blue p-4 text-sm">
          <p>
            <span className="font-bold">Billed to:</span> {parent?.full_name ?? "Parent"}
          </p>
          {student && (
            <p>
              <span className="font-bold">For:</span> {student.full_name}
            </p>
          )}
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-3">{invoice.description}</td>
              <td className="py-3 text-right font-bold">{fmtCents(invoice.amount_cents)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-display font-bold text-lg">Total</td>
              <td className="pt-3 text-right font-display font-bold text-lg">
                {fmtCents(invoice.amount_cents)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-6 rounded-2xl bg-pastel-green p-3 text-center text-sm font-bold">
          {invoice.status === "paid"
            ? `✅ Paid ${invoice.paid_at ? `on ${new Date(invoice.paid_at).toLocaleDateString("en-ZA")}` : ""} — thank you!`
            : `Status: ${invoice.status}`}
        </p>
        <p className="mt-4 text-center text-[10px] text-ink-soft">
          Payments processed securely by PayFast · hello@lewistutoring.co.za
        </p>
      </div>
    </div>
  );
}
