import { CloudPal } from "@/components/brand/mascots";
import { ButtonLink, Card } from "@/components/ui";

export const metadata = { title: "Payment cancelled" };

export default function PaymentCancelledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream dotted-paper px-5">
      <Card className="max-w-md p-8 text-center">
        <CloudPal size={84} mood="sleepy" className="mx-auto animate-float" />
        <h1 className="mt-4 font-display font-bold text-3xl">No worries at all 💛</h1>
        <p className="mt-3 text-ink-soft">
          The payment was cancelled — nothing was charged. Your lesson slot is still pencilled
          in, and you can finish up whenever you&apos;re ready.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href="/parent/billing" size="lg" variant="sunshine">
            Try again from my portal
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to the homepage
          </ButtonLink>
        </div>
      </Card>
    </main>
  );
}
