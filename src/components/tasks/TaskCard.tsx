"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/notion/tasks";

const PRIORITY_STRIP: Record<string, string> = {
  Urgent: "#ef4444",
  High:   "#f97316",
  Medium: "#eab308",
  Low:    "#64748b",
};

const PRIORITY_BADGE: Record<string, string> = {
  Urgent: "badge-urgent",
  High:   "badge-high",
  Medium: "badge-medium",
  Low:    "badge-low",
};

type Props = {
  task: Task;
  onOpen: (task: Task) => void;
};

export function TaskCard({ task, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
    : undefined;

  const stripColor = task.priority ? (PRIORITY_STRIP[task.priority] ?? "#1e293b") : "#1e293b";
  const badgeClass = task.priority ? (PRIORITY_BADGE[task.priority] ?? "badge-low") : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg border border-white/10 bg-black/40 p-3 hover:border-white/25 hover:-translate-y-px hover:shadow-lg hover:shadow-black/40 transition-all duration-150 overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Priority left strip */}
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: stripColor, opacity: 0.75 }}
      />

      {/* Drag handle covers entire card */}
      <div {...listeners} {...attributes} className="absolute inset-0 z-0" />

      {/* Content — z-10 so clicks register, triggers modal */}
      <div className="relative z-10 pl-1" onClick={() => onOpen(task)}>
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
