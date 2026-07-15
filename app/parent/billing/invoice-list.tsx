"use client";

import Link from "next/link";
import { useState } from "react";
import { payInvoice } from "@/app/actions/billing";
import { submitPayfast } from "@/components/portal/payfast-submit";
import { EmptyState, fmtCents, fmtDate } from "@/components/portal/widgets";
import { Button, Card, Chip } from "@/components/ui";

type Invoice = {
  id: string;
  number: string;
  description: string;
  amount_cents: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
};

const STATUS_TONE = {
  pending: "sunshine",
  paid: "grass",
  cancelled: "navy",
  refunded: "lilac",
} as const;

const STATUS_LABEL = {
  pending: "⏳ Awaiting payment",
  paid: "✅ Paid",
  cancelled: "✖ Cancelled",
  refunded: "↩ Refunded",
} as const;

export function InvoiceList({
  invoices,
  basePath = "/parent/billing",
}: {
  invoices: Invoice[];
  basePath?: string;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!invoices.length) {
    return (
      <EmptyState
        title="No invoices yet"
        hint="When you book lessons or buy a package, invoices appear here automatically."
      />
    );
  }

  async function pay(id: string) {
    setBusyId(id);
    setError(null);
    const res = await payInvoice(id);
    if (!res.ok) {
      setError(res.error);
      setBusyId(null);
      return;
    }
    submitPayfast(res.checkout);
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
      )}
      {invoices.map((inv) => (
        <Card key={inv.id} className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold">
              {inv.number} <span className="text-ink-soft font-sans text-sm">· {inv.description}</span>
            </p>
            <p className="text-xs text-ink-soft">
              Issued {fmtDate(inv.issued_at)}
              {inv.paid_at && ` · paid ${fmtDate(inv.paid_at)}`}
              {inv.status === "pending" && inv.due_at && ` · due ${fmtDate(inv.due_at)}`}
            </p>
          </div>
          <p className="font-display font-bold text-lg">{fmtCents(inv.amount_cents)}</p>
          <Chip tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Chip>
          {inv.status === "pending" ? (
            <Button size="sm" onClick={() => pay(inv.id)} disabled={busyId === inv.id}>
              {busyId === inv.id ? "Opening PayFast…" : "Pay now 🔒"}
            </Button>
          ) : (
            <Link
              href={`${basePath}/${inv.id}`}
              className="font-display text-sm font-bold text-sky-deep underline underline-offset-2"
            >
              View / print
            </Link>
          )}
        </Card>
      ))}
    </div>
  );
}
