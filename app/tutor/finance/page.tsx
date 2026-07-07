import { EmptyState, PageTitle, StatCard, fmtCents, fmtDate } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { RevenueChartCard } from "./revenue-chart";

export const metadata = { title: "Finance" };

export default async function FinancePage() {
  const supabase = await createServerSupabase();
  const [{ data: kpis }, { data: monthly }, { data: invoices }] = await Promise.all([
    supabase.from("v_admin_kpis").select("*").single(),
    supabase.from("v_monthly_revenue").select("*").order("month").limit(12),
    supabase
      .from("invoices")
      .select("id, number, description, amount_cents, status, issued_at, profiles!invoices_parent_id_fkey(full_name)")
      .order("issued_at", { ascending: false })
      .limit(25),
  ]);

  return (
    <>
      <PageTitle title="Finance 💰" sub="Every rand, accounted for — invoices write themselves." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Revenue this month" value={fmtCents(kpis?.revenue_this_month_cents ?? 0)} emoji="🌟" tone="grass" />
        <StatCard label="Outstanding" value={fmtCents(kpis?.outstanding_cents ?? 0)} emoji="⏳" tone="sunshine" />
        <StatCard label="Lessons next 7 days" value={kpis?.lessons_next_7d ?? 0} emoji="🗓️" tone="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChartCard
          data={(monthly ?? []).map((m) => ({
            label: new Date(m.month!).toLocaleDateString("en-ZA", { month: "short" }),
            value: (m.revenue_cents ?? 0) / 100,
          }))}
        />
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">Latest invoices 🧾</h2>
          {invoices?.length ? (
            <ul className="space-y-2.5">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-cream p-3 text-sm">
                  <span className="font-display font-bold">{inv.number}</span>
                  <span className="min-w-0 flex-1 truncate text-ink-soft">
                    {(inv.profiles as unknown as { full_name: string } | null)?.full_name} · {inv.description}
                  </span>
                  <span className="font-bold">{fmtCents(inv.amount_cents)}</span>
                  <Chip tone={inv.status === "paid" ? "grass" : inv.status === "pending" ? "sunshine" : "navy"}>
                    {inv.status}
                  </Chip>
                  <span className="text-xs text-ink-soft">{fmtDate(inv.issued_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No invoices yet" hint="They appear automatically when families book & buy." />
          )}
        </Card>
      </div>
    </>
  );
}
