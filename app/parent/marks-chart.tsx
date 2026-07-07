"use client";

import { TrendLine } from "@/components/charts";
import { EmptyState } from "@/components/portal/widgets";
import { Card } from "@/components/ui";

export function MarksChartCard({ marks }: { marks: { label: string; value: number }[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display font-bold text-lg">Marks over time 📈</h2>
      {marks.length >= 2 ? (
        <TrendLine data={marks} />
      ) : (
        <EmptyState
          title="Not enough marks yet"
          hint="After a couple of tests you'll see the trend climbing here."
        />
      )}
    </Card>
  );
}
