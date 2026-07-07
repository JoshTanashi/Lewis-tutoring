"use client";

import { CHART, ValueBars } from "@/components/charts";
import { EmptyState } from "@/components/portal/widgets";
import { Card } from "@/components/ui";

export function AdminCharts({
  revenue,
  subjects,
}: {
  revenue: { label: string; value: number }[];
  subjects: { label: string; value: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="mb-3 font-display font-bold text-lg">Revenue by month 💰</h2>
        {revenue.length ? (
          <ValueBars data={revenue} color={CHART.grass} format={(v) => `R${v.toLocaleString("en-ZA")}`} />
        ) : (
          <EmptyState title="No revenue yet" hint="The first paid invoice starts this chart." />
        )}
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 font-display font-bold text-lg">Students by subject 📚</h2>
        {subjects.length ? (
          <ValueBars data={subjects} color={CHART.sky} />
        ) : (
          <EmptyState title="No enrolments yet" hint="Subject popularity shows up here." />
        )}
      </Card>
    </div>
  );
}
