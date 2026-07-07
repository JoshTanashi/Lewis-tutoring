"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setPackagePrice } from "@/app/actions/admin";
import { Button, Input } from "@/components/ui";

type Pkg = {
  slug: string;
  name: string;
  emoji: string;
  lessons_per_month: number;
  price_cents: number;
  active: boolean;
};

export function PricingEditor({ packages }: { packages: Pkg[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(slug: string) {
    const rand = Number(drafts[slug]);
    if (!rand || rand <= 0) return;
    setBusy(slug);
    setMsg(null);
    const res = await setPackagePrice(slug, Math.round(rand * 100));
    setMsg(res.ok ? "Saved! ✨" : res.error);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {packages.map((p) => (
        <div key={p.slug} className="flex items-center gap-3 rounded-2xl border-2 border-line p-3">
          <span className="text-xl">{p.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-sm">{p.name}</p>
            <p className="text-xs text-ink-soft">
              {p.lessons_per_month} lesson{p.lessons_per_month > 1 ? "s" : ""}/month
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-ink-soft">R</span>
            <Input
              type="number"
              className="!w-24 !py-1.5 text-sm"
              placeholder={(p.price_cents / 100).toString()}
              value={drafts[p.slug] ?? ""}
              onChange={(e) => setDrafts({ ...drafts, [p.slug]: e.target.value })}
            />
          </div>
          <Button size="sm" variant="outline" disabled={busy === p.slug || !drafts[p.slug]} onClick={() => save(p.slug)}>
            Save
          </Button>
        </div>
      ))}
      {msg && <p className="rounded-xl bg-pastel-green px-3 py-2 text-xs font-bold text-grass-deep">{msg}</p>}
    </div>
  );
}
