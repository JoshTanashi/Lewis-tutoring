import { StarPal, RainbowArc } from "@/components/brand/mascots";

export default function Loading() {
  return (
    <div className="flex flex-1 min-h-[60vh] flex-col items-center justify-center gap-6 bg-cream">
      <div className="relative">
        <RainbowArc size={150} className="opacity-80" />
        <StarPal
          size={64}
          mood="excited"
          className="absolute left-1/2 -translate-x-1/2 -bottom-2 animate-bounce-soft"
        />
      </div>
      <p className="font-display font-bold text-navy text-lg animate-pulse">
        Warming up the crayons…
      </p>
    </div>
  );
}
