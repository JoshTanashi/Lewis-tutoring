"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNight = !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-cream/90 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(31,58,95,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo size="sm" onNight={onNight} />

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 font-display font-semibold text-sm transition ${
                onNight ? "text-white/85 hover:text-white hover:bg-white/10" : "text-navy hover:bg-navy/8"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className={`rounded-full px-4 py-2 font-display font-semibold text-sm transition ${
              onNight ? "text-white/85 hover:text-white hover:bg-white/10" : "text-navy hover:bg-navy/8"
            }`}
          >
            Sign in
          </Link>
          <ButtonLink href="/signup" size="sm" variant={onNight ? "sunshine" : "primary"}>
            Book a lesson ✨
          </ButtonLink>
        </div>

        {/* mobile burger */}
        <button
          className={`md:hidden rounded-full p-2 ${onNight ? "text-white" : "text-navy"}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            {open ? (
              <>
                <path d="M6 6 L18 18" />
                <path d="M18 6 L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7 H20" />
                <path d="M4 12 H20" />
                <path d="M4 17 H20" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-line bg-cream px-5 pb-5 pt-2 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 font-display font-semibold text-navy hover:bg-navy/8"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-2xl px-4 py-3 font-display font-semibold text-navy hover:bg-navy/8"
          >
            Sign in
          </Link>
          <ButtonLink href="/signup" className="mt-2 justify-center">
            Book a lesson ✨
          </ButtonLink>
        </div>
      )}
    </header>
  );
}
