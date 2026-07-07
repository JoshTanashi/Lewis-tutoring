import { PageTitle, fmtCents } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { PricingEditor } from "./pricing-editor";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const [{ data: settings }, { data: packages }, { data: waitlist }] = await Promise.all([
    supabase.from("settings").select("key, value"),
    supabase
      .from("packages")
      .select("slug, name, emoji, lessons_per_month, price_cents, active")
      .order("price_cents"),
    supabase.from("waitlist").select("email, created_at").order("created_at", { ascending: false }),
  ]);

  const setting = (k: string) => settings?.find((s) => s.key === k)?.value as string | number | undefined;

  return (
    <>
      <PageTitle title="Settings ⚙️" sub="The knobs and dials of Lewis Tutoring." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold text-lg">Payments 💳</h2>
            <div className="flex items-center gap-2">
              <Chip tone={setting("payfast_mode") === "live" ? "grass" : "sunshine"}>
                PayFast: {String(setting("payfast_mode") ?? "sandbox")} mode
              </Chip>
              <Chip tone="lilac">Sibling discount: {String(setting("sibling_discount_pct") ?? 10)}%</Chip>
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              To go live: add your real PayFast merchant ID, key and passphrase as environment
              variables (<code className="font-mono">PAYFAST_MODE=live</code>) in the app and in the
              <code className="font-mono"> payfast-itn</code> edge function — see the README.
              Sandbox payments are free to test with!
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold text-lg">Video lessons waitlist 🎬</h2>
            {waitlist?.length ? (
              <ul className="max-h-56 space-y-1.5 overflow-y-auto text-sm">
                {waitlist.map((w) => (
                  <li key={w.email} className="flex justify-between rounded-xl bg-cream px-3 py-1.5">
                    <span className="font-bold">{w.email}</span>
                    <span className="text-xs text-ink-soft">
                      {new Date(w.created_at).toLocaleDateString("en-ZA")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">
                No sign-ups yet — they&apos;ll collect here from the landing page teaser.
              </p>
            )}
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h2 className="mb-1 font-display font-bold text-lg">Pricing 🏷️</h2>
          <p className="mb-4 text-xs text-ink-soft">
            Live prices — new checkouts use these immediately. Current single lesson:{" "}
            {fmtCents(packages?.find((p) => p.slug === "single")?.price_cents ?? 25000)}.
          </p>
          <PricingEditor packages={packages ?? []} />
        </Card>
      </div>
    </>
  );
}
