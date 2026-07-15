"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { CrownPal, HeartPal, PencilPal, StarPal } from "@/components/brand/mascots";
import { NotificationBell, type Notice } from "@/components/portal/bell";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { Role } from "@/lib/roles";

export type NavItem = { href: string; label: string; icon: string };

const MASCOT: Record<Role, ReactNode> = {
  student: <StarPal size={38} mood="excited" />,
  parent: <HeartPal size={38} mood="excited" />,
  tutor: <PencilPal size={38} mood="excited" />,
  super_admin: <CrownPal size={38} mood="excited" />,
};

const PORTAL_NAME: Record<Role, string> = {
  student: "My Space",
  parent: "Parent Portal",
  tutor: "Tutor HQ",
  super_admin: "Mission Control",
};

export function PortalShell({
  role,
  userName,
  nav,
  children,
  kidMode = false,
  notices = [],
}: {
  role: Role;
  userName: string;
  nav: NavItem[];
  children: ReactNode;
  kidMode?: boolean;
  notices?: Notice[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navEl = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          item.href === pathname ||
          (item.href.split("/").length > 2 && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-display font-bold text-sm transition ${
              active
                ? kidMode
                  ? "bg-sunshine text-navy border-2 border-navy"
                  : "bg-navy text-white"
                : "text-navy/80 hover:bg-navy/8"
            }`}
          >
            <Image
              src={`/icons/${item.icon}.webp`}
              alt=""
              width={24}
              height={24}
              className={active && !kidMode ? "brightness-0 invert" : ""}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={`min-h-screen ${kidMode ? "bg-pastel-blue" : "bg-cream"}`}>
      {/* top bar (mobile) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-2.5 backdrop-blur md:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <NotificationBell notices={notices} />
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full p-2 text-navy"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            {open ? <><path d="M6 6 L18 18" /><path d="M18 6 L6 18" /></> : <><path d="M4 7 H20" /><path d="M4 12 H20" /><path d="M4 17 H20" /></>}
          </svg>
        </button>
        </div>
      </header>
      {open && (
        <div className="border-b border-line bg-paper p-4 md:hidden">
          {navEl}
          <button onClick={signOut} className="mt-3 w-full rounded-2xl px-3.5 py-2.5 text-left font-display font-bold text-sm text-coral hover:bg-pastel-pink">
            👋 Sign out
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl">
        {/* sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-line bg-paper/70 p-4 md:flex">
          <div>
            <div className="mb-6 px-2">
              <Logo size="sm" />
            </div>
            <div className={`mb-5 flex items-center gap-2.5 rounded-2xl p-3 ${kidMode ? "card-sticker bg-pastel-yellow" : "bg-pastel-blue rounded-2xl"}`}>
              <span className="animate-float">{MASCOT[role]}</span>
              <div className="min-w-0">
                <p className="truncate font-display font-bold text-sm leading-tight">{userName}</p>
                <p className="text-[10px] font-bold text-ink-soft">{PORTAL_NAME[role]}</p>
              </div>
            </div>
            {navEl}
          </div>
          <button
            onClick={signOut}
            className="rounded-2xl px-3.5 py-2.5 text-left font-display font-bold text-sm text-coral hover:bg-pastel-pink"
          >
            👋 Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          <div className="mb-2 hidden justify-end md:flex">
            <NotificationBell notices={notices} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
