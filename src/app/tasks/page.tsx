import { TaskBoard } from "@/components/tasks/TaskBoard";
import { QuickAdd } from "@/components/tasks/QuickAdd";
import { ChronoCountdown } from "@/components/ornaments/ChronoCountdown";
import { getTasksForBoard } from "@/lib/notion/tasks";

function isIdea(t: any) {
  return (t.bucket ?? "").toLowerCase() === "idea";
}

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getTasksForBoard();
  const ideas = tasks.filter(isIdea);
  const work = tasks.filter((t) => !isIdea(t));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-white/60">Notion-backed. Changes sync instantly.</p>
        </div>
      </div>

      <ChronoCountdown />
      <QuickAdd />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskBoard tasks={work} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <div className="text-sm font-semibold">Ideas inbox</div>
              <div className="text-xs text-white/50">Bucket=Idea · priority blank by default</div>
            </div>
            <div className="text-xs font-mono text-white/40">{ideas.length}</div>
          </div>
          <div className="p-3 space-y-2">
            {ideas.slice(0, 12).map((t) => (
              <div key={t.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="text-sm text-white/85 truncate">{t.title}</div>
                {t.summary && (
                  <div className="mt-1 text-xs text-white/50 line-clamp-2">{t.summary}</div>
                )}
                <div className="mt-2 text-[11px] font-mono text-white/30">{t.updatedAtLabel}</div>
              </div>
            ))}
            {ideas.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-white/35 font-mono text-center">
                No ideas yet. Flip Quick Add to “Idea” and dump thoughts here.
              </div>
            )}
            {ideas.length > 12 && (
              <div className="text-[11px] font-mono text-white/35">+{ideas.length - 12} more…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
