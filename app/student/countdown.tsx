"use client";

import { useEffect, useState } from "react";

function parts(to: string) {
  const diff = Math.max(0, new Date(to).getTime() - Date.now());
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return { d, h, m };
}

export function Countdown({ to }: { to: string }) {
  const [t, setT] = useState(() => parts(to));
  useEffect(() => {
    const id = setInterval(() => setT(parts(to)), 30_000);
    return () => clearInterval(id);
  }, [to]);

  return (
    <p className="mt-1 text-xs font-extrabold text-coral-deep">
      in {t.d > 0 && `${t.d}d `}
      {t.h}h {t.m}m — get ready! 🎒
    </p>
  );
}
