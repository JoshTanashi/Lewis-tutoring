"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { markAllNotificationsRead } from "@/app/actions/notifications";

export type Notice = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

/** The top-right notification bell — keeps everyone up to date. */
export function NotificationBell({ notices }: { notices: Notice[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notices.filter((n) => !n.read_at).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && unread > 0) {
      await markAllNotificationsRead();
      router.refresh();
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className={`squash relative flex size-10 items-center justify-center rounded-full border-2 ${
          unread ? "border-coral bg-pastel-pink" : "border-line bg-paper"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-coral font-display text-[10px] font-bold text-white animate-bounce-soft">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-2xl border-2 border-line bg-paper shadow-pop">
          <p className="border-b border-line bg-pastel-yellow px-4 py-2 font-display text-sm font-bold">
            🔔 What&apos;s new
          </p>
          <div className="max-h-96 overflow-y-auto">
            {notices.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-soft">
                All quiet — nothing new right now. ☁️
              </p>
            )}
            {notices.map((n) => {
              const inner = (
                <div className={`border-b border-line px-4 py-3 ${n.read_at ? "" : "bg-pastel-blue/60"}`}>
                  <p className="text-sm font-bold leading-snug">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-ink-soft leading-snug">{n.body}</p>}
                  <p className="mt-1 text-[10px] font-bold text-ink-soft/70">
                    {new Date(n.created_at).toLocaleString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block hover:bg-cream">
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
