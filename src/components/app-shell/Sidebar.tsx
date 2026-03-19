import Link from "next/link";
import { NavItem } from "@/components/app-shell/nav";
import { SpinningGlobe } from "@/components/ornaments/SpinningGlobe";

const NAV: NavItem[] = [
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/projects", label: "Projects", icon: "🗂️" },
  { href: "/ops", label: "Ops", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-[240px] shrink-0 border-r border-white/10 bg-black/50 md:block">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <SpinningGlobe size={40} />
          <div>
            <div className="text-sm font-semibold tracking-wide text-white/85">
              Mission Control
            </div>
            <div className="text-xs text-white/50">OpenClaw · Notion</div>
          </div>
        </div>
      </div>

      <nav className="px-2 pb-6">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 text-xs text-white/40">
        <div>mc.taskcocoon.com</div>
        <div className="mt-1">v2 rewrite (WIP)</div>
      </div>
    </aside>
  );
}
