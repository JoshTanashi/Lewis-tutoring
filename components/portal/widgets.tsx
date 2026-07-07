import type { ReactNode } from "react";
import { BlobPal } from "@/components/brand/mascots";
import { Card } from "@/components/ui";

export function PageTitle({
  title,
  sub,
  action,
}: {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const TONES = {
  coral: "bg-pastel-pink",
  sunshine: "bg-pastel-yellow",
  grass: "bg-pastel-green",
  sky: "bg-pastel-blue",
  lilac: "bg-pastel-purple",
} as const;

export function StatCard({
  label,
  value,
  hint,
  emoji,
  tone = "sky",
  sticker = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  emoji?: string;
  tone?: keyof typeof TONES;
  sticker?: boolean;
}) {
  return (
    <Card sticker={sticker} className={`p-4 ${TONES[tone]}`}>
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-ink-soft uppercase">
        {emoji && <span className="text-sm">{emoji}</span>}
        {label}
      </p>
      <p className="mt-1 font-display font-bold text-2xl text-navy">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
    </Card>
  );
}

export function EmptyState({
  title,
  hint,
  color = "var(--color-sky)",
}: {
  title: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line bg-paper/60 px-6 py-10 text-center">
      <BlobPal size={64} color={color} mood="sleepy" className="animate-float" />
      <p className="font-display font-bold text-navy">{title}</p>
      {hint && <p className="max-w-xs text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function fmtDate(d: string | Date, withTime = false): string {
  return new Date(d).toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function fmtCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA").replace(/,/g, " ")}`;
}
