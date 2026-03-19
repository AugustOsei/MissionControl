import type { Task } from "@/lib/notion/tasks";

const PRIORITY_STRIP: Record<string, string> = {
  Urgent: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#64748b",
};

const PRIORITY_BADGE: Record<string, string> = {
  Urgent: "badge-urgent",
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
};

export function TaskCard({ task }: { task: Task }) {
  const stripColor = task.priority ? (PRIORITY_STRIP[task.priority] ?? "#334155") : "#1e293b";
  const badgeClass = task.priority ? (PRIORITY_BADGE[task.priority] ?? "badge-low") : null;

  return (
    <div
      className="group relative rounded-lg border border-white/10 bg-black/40 p-3 hover:border-white/25 hover:-translate-y-px hover:shadow-lg hover:shadow-black/40 transition-all duration-150 overflow-hidden"
    >
      {/* Priority left strip */}
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: stripColor, opacity: 0.75 }}
      />

      <div className="pl-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              {task.title}
            </div>
            {task.projectName && (
              <div className="mt-0.5 truncate text-[11px] text-white/45 font-mono">
                {task.projectName}
              </div>
            )}
          </div>
          {badgeClass && (
            <div className={`shrink-0 ${badgeClass}`}>{task.priority}</div>
          )}
        </div>

        {task.summary && (
          <div className="mt-2 line-clamp-2 text-xs text-white/55 leading-relaxed">
            {task.summary}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-white/35 font-mono">{task.assignee ?? ""}</div>
          <div className="text-[11px] text-white/30 font-mono">{task.updatedAtLabel}</div>
        </div>
      </div>
    </div>
  );
}
