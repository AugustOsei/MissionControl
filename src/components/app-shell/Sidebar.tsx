"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { OpenClawLogo } from "@/components/ornaments/OpenClawLogo";

const NAV = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" opacity="0.55" />
        <rect x="8.5" y="1" width="6.5" height="4.5" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="8.5" y="6.5" width="6.5" height="9" rx="1.5" fill="currentColor" opacity="0.35" />
        <rect x="1" y="8.5" width="6.5" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.7" />
        <rect x="1" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.7" />
        <rect x="1" y="11.5" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.7" />
        <path d="M12.5 6 L14 7.5 L16.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="5" width="6.5" height="5" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="1" y="11.5" width="6.5" height="3" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="9" y="11.5" width="6" height="3" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="3.5" y="2" width="9" height="2" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/ops",
    label: "Ops",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
        <path d="M3.5 5 L5.5 7 L3.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="7.5" y="7.5" width="5" height="1.3" rx="0.65" fill="currentColor" opacity="0.6" />
        <rect x="4" y="12.5" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        <rect x="7" y="11" width="2" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/news",
    label: "News",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
        <rect x="4" y="5" width="8" height="1.4" rx="0.7" fill="currentColor" opacity="0.6" />
        <rect x="4" y="8" width="6.5" height="1.4" rx="0.7" fill="currentColor" opacity="0.55" />
        <rect x="4" y="11" width="7.5" height="1.4" rx="0.7" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/agents",
    label: "Agents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
        <path d="M5 6.2c0-1.2 1.2-2.2 3-2.2s3 1 3 2.2c0 1.2-1.2 2.2-3 2.2s-3-1-3-2.2Z" fill="currentColor" opacity="0.45" />
        <path d="M4.4 12.2c.6-1.8 2.1-2.7 3.6-2.7s3 .9 3.6 2.7" stroke="currentColor" strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
      </svg>
    ),
  },
];

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
              active
                ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 pl-[10px]"
                : "text-white/55 border-l-2 border-transparent hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <span className={active ? "text-blue-400" : "text-white/40"}>{item.icon}</span>
            <span className={active ? "font-medium" : ""}>{item.label}</span>
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when the mobile drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <OpenClawLogo size={26} />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-white/90">Mission Control</div>
              <div className="text-[11px] text-white/35 font-mono">mc.taskcocoon.com</div>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="mc-mobile-nav"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel */}
          <aside
            id="mc-mobile-nav"
            className="absolute left-0 top-0 h-full w-[85%] max-w-[280px] border-r border-white/10 bg-black/90 backdrop-blur p-3 flex flex-col"
          >
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <div className="flex items-center gap-2">
                <OpenClawLogo size={30} />
                <div>
                  <div className="text-sm font-semibold tracking-wide text-white/90">Mission Control</div>
                  <div className="text-[11px] text-white/40 font-mono mt-0.5">OpenClaw · Notion</div>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-white/70 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-1 pt-2 pb-4 space-y-0.5">
              <NavItems pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </nav>

            <div className="px-2 py-3 border-t border-white/5 space-y-0.5">
              <div className="text-[11px] text-white/30 font-mono">mc.taskcocoon.com</div>
              <div className="text-[11px] text-white/20 font-mono">v2.1 · live</div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden w-[220px] shrink-0 flex-col border-r border-white/10 bg-black/60 md:flex"
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <OpenClawLogo size={38} />
          <div>
            <div className="text-sm font-semibold tracking-wide text-white/90">Mission Control</div>
            <div className="text-[11px] text-white/40 font-mono mt-0.5">OpenClaw · Notion</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 pb-6 space-y-0.5">
          <NavItems pathname={pathname} />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/5 space-y-0.5">
          <div className="text-[11px] text-white/30 font-mono">mc.taskcocoon.com</div>
          <div className="text-[11px] text-white/20 font-mono">v2.1 · live</div>
        </div>
      </aside>
    </>
  );
}
