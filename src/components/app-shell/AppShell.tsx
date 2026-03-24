import { Sidebar } from "@/components/app-shell/Sidebar";
import { Topbar } from "@/components/app-shell/Topbar";
import { ActivityRail } from "@/components/app-shell/ActivityRail";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="flex flex-col md:flex-row">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-3 py-4 md:px-6">
            <div className="mx-auto flex w-full max-w-none md:max-w-7xl gap-4">
              <div className="min-w-0 flex-1">{children}</div>
              <div className="hidden w-[340px] shrink-0 lg:block">
                <ActivityRail />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
