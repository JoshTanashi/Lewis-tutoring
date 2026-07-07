"use client";

/* Charts follow the dataviz method: single-hue marks (validated palette:
   sky #3186E8 · amber #C77F00 · coral #E04656 · lilac #7A57E0 · grass #4E9E4B
   on cream), thin rounded marks, recessive grid, tooltips on hover,
   text in ink tokens — never the series color. */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const CHART = {
  sky: "#3186E8",
  amber: "#C77F00",
  coral: "#E04656",
  lilac: "#7A57E0",
  grass: "#4E9E4B",
  grid: "#e8e0d4",
  ink: "#1F3A5F",
  inkSoft: "#5a6b85",
};

const tooltipStyle = {
  background: "#FFFDF9",
  border: "1px solid #e8e0d4",
  borderRadius: 14,
  fontSize: 12,
  fontWeight: 700,
  color: CHART.ink,
  boxShadow: "0 8px 24px -12px rgba(31,58,95,.3)",
};

const axisProps = {
  tick: { fill: CHART.inkSoft, fontSize: 11, fontWeight: 700 },
  axisLine: { stroke: CHART.grid },
  tickLine: false as const,
};

/** Marks over time — one line per chart (identity carried by the title). */
export function TrendLine({
  data,
  color = CHART.sky,
  unit = "%",
  height = 220,
}: {
  data: { label: string; value: number }[];
  color?: string;
  unit?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={CHART.grid} strokeDasharray="2 6" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={46} unit={unit} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: CHART.grid }} formatter={(v) => [`${v}${unit}`, ""]} separator="" />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#FFFDF9" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Simple magnitude bars — single hue, rounded data-end, 2px gaps. */
export function ValueBars({
  data,
  color = CHART.sky,
  height = 220,
  format = (v: number) => String(v),
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }} barCategoryGap="28%">
        <CartesianGrid stroke={CHART.grid} strokeDasharray="2 6" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={54} tickFormatter={format} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(31,58,95,0.05)" }}
          formatter={(v) => [format(Number(v)), ""]}
          separator=""
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}
