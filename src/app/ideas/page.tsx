import { QuickAdd } from "@/components/tasks/QuickAdd";
import { getTasksForBoard } from "@/lib/notion/tasks";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const tasks = await getTasksForBoard();
  const ideas = tasks
    .filter((t) => (t.bucket ?? "").toLowerCase() === "idea")
    .slice(0, 200);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Ideas</h1>
          <p className="text-sm text-white/60">Dump thoughts here. Convert later.</p>
        </div>
      </div>

      <QuickAdd defaultMode="Idea" />

      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <div className="text-sm font-semibold">Idea inbox</div>
            <div className="text-xs text-white/50">Bucket=Idea · priority blank</div>
          </div>
          <div className="text-xs font-mono text-white/40">{ideas.length}</div>
        </div>
        <div className="p-3 space-y-2">
          {ideas.map((t) => (
            <div key={t.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
              <div className="text-sm text-white/85">{t.title}</div>
              {t.summary && <div className="mt-1 text-xs text-white/50 whitespace-pre-wrap">{t.summary}</div>}
              <div className="mt-2 text-[11px] font-mono text-white/30">updated: {t.updatedAtLabel}</div>
            </div>
          ))}

          {ideas.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/10 p-6 text-xs text-white/35 font-mono text-center">
              No ideas yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
