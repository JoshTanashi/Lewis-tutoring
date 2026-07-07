"use client";

import { CHART, ValueBars } from "@/components/charts";
import { EmptyState } from "@/components/portal/widgets";
import { Card } from "@/components/ui";

export function RevenueChartCard({ data }: { data: { label: string; value: number }[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display font-bold text-lg">Monthly revenue 📈</h2>
      {data.length ? (
        <ValueBars data={data} color={CHART.grass} format={(v) => `R${v.toLocaleString("en-ZA")}`} />
      ) : (
        <EmptyState title="No revenue yet" hint="The first paid invoice starts the chart." />
      )}
    </Card>
  );
}
