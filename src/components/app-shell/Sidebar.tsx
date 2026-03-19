"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpenClawLogo } from "@/components/ornaments/OpenClawLogo";

const NAV = [
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
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-white/10 bg-black/60 md:flex" style={{ minHeight: "100vh" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <OpenClawLogo size={38} />
        <div>
          <div className="text-sm font-semibold tracking-wide text-white/90">
            Mission Control
          </div>
          <div className="text-[11px] text-white/40 font-mono mt-0.5">OpenClaw · Notion</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 pb-6 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 pl-[10px]"
                  : "text-white/55 border-l-2 border-transparent hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <span className={active ? "text-blue-400" : "text-white/40"}>{item.icon}</span>
              <span className={active ? "font-medium" : ""}>{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 space-y-0.5">
        <div className="text-[11px] text-white/30 font-mono">mc.taskcocoon.com</div>
        <div className="text-[11px] text-white/20 font-mono">v2.1 · live</div>
      </div>
    </aside>
  );
}
