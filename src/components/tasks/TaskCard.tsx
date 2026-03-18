import type { Task } from "@/lib/notion/tasks";

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-3 hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white/90">
            {task.title}
          </div>
          {task.projectName && (
            <div className="mt-1 truncate text-xs text-white/50">
              {task.projectName}
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/60">
          {task.priority ?? ""}
        </div>
      </div>

      {task.summary && (
        <div className="mt-2 line-clamp-2 text-xs text-white/60">
          {task.summary}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
        <div>{task.assignee ?? ""}</div>
        <div>{task.updatedAtLabel}</div>
      </div>
    </div>
  );
}
