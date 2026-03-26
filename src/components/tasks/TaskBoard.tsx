"use client";

import { useState, useCallback } from "react";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import type { Task } from "@/lib/notion/tasks";

const COLS = [
  { key: "Backlog",  title: "Backlog" },
  { key: "Todo",     title: "Todo" },
  { key: "Doing",    title: "Doing" },
  { key: "Done",     title: "Done" },
  { key: "Archived", title: "Archived" },
] as const;

const DEFAULT_VISIBLE = 5;

const STATUS_STYLE: Record<string, { border: string; text: string; dot: string; pulse: boolean }> = {
  Backlog:  { border: "border-slate-500/30",  text: "text-slate-400",  dot: "bg-slate-400",  pulse: false },
  Todo:     { border: "border-blue-500/35",   text: "text-blue-400",   dot: "bg-blue-400",   pulse: false },
  Doing:    { border: "border-amber-500/40",  text: "text-amber-400",  dot: "bg-amber-400",  pulse: true  },
  Done:     { border: "border-green-500/35",  text: "text-green-400",  dot: "bg-green-400",  pulse: false },
  Archived: { border: "border-white/8",       text: "text-white/30",   dot: "bg-white/30",   pulse: false },
};

function Column({
  colKey, title, tasks, onOpen, isOver,
}: {
  colKey: string;
  title: string;
  tasks: Task[];
  onOpen: (task: Task) => void;
  isOver: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tasks : tasks.slice(0, DEFAULT_VISIBLE);
  const hidden = tasks.length - DEFAULT_VISIBLE;
  const style = STATUS_STYLE[colKey] ?? STATUS_STYLE.Backlog;

  const { setNodeRef } = useDroppable({ id: colKey });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border ${style.border} transition-colors duration-150 ${
        isOver ? "bg-white/[0.07] ring-1 ring-white/20" : "bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${style.dot} ${style.pulse ? "animate-pulse" : ""}`} />
          <span className={`text-sm font-medium ${style.text}`}>{title}</span>
        </div>
        <div className="text-xs text-white/30 font-mono">{tasks.length}</div>
      </div>

      <div className="space-y-2 p-2">
        {visible.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={onOpen} />
        ))}

        {tasks.length === 0 && (
          <div className={`rounded-lg border border-dashed p-4 text-xs text-center font-mono transition-colors ${
            isOver ? "border-white/25 text-white/40" : "border-white/8 text-white/25"
          }`}>
            drop here
          </div>
        )}

        {!expanded && hidden > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full rounded-lg border border-dashed border-white/10 py-2 text-xs text-white/35 hover:border-white/20 hover:text-white/55 transition-colors font-mono"
          >
            +{hidden} more
          </button>
        )}

        {expanded && tasks.length > DEFAULT_VISIBLE && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full rounded-lg border border-dashed border-white/10 py-2 text-xs text-white/35 hover:border-white/20 hover:text-white/55 transition-colors font-mono"
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}

export function TaskBoard({ tasks: initialTasks, showDone = false }: { tasks: Task[]; showDone?: boolean }) {
  const [tasks, setTasks] = useState(initialTasks.filter((t) => showDone ? true : t.status !== "Done"));
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStatus = new Map<string, Task[]>();
  for (const c of COLS) byStatus.set(c.key, []);
  for (const t of tasks) {
    const key = byStatus.has(t.status) ? t.status : "Backlog";
    byStatus.get(key)!.push(t);
  }

  const total = tasks.length;
  const done = (byStatus.get("Done") ?? []).length;
  const inProgress = (byStatus.get("Doing") ?? []).length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task;
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: any) {
    setDraggingOver(event.over?.id ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setDraggingOver(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    // Sync to Notion
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    // Revert on failure
    if (!res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
      );
    }
  }

  const handleStatusChange = useCallback((taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setModalTask((m) => (m?.id === taskId ? { ...m, status: newStatus } : m));
  }, []);

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="card">
            <div className="cardTitle">This week</div>
            <div className="cardValue">{tasks.filter((t) => t.isThisWeek).length}</div>
            <div className="cardSub">updated</div>
          </div>
          <div className="card">
            <div className="cardTitle">In progress</div>
            <div className="cardValue">{inProgress}</div>
            <div className="cardSub">Doing</div>
          </div>
          <div className="card">
            <div className="cardTitle">Total</div>
            <div className="cardValue">{total}</div>
            <div className="cardSub">tasks</div>
          </div>
          <div className="card">
            <div className="cardTitle">Completion</div>
            <div className="cardValue">{completion}%</div>
            <div className="cardSub">Done / Total</div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            {COLS.map((c) => (
              <Column
                key={c.key}
                colKey={c.key}
                title={c.title}
                tasks={byStatus.get(c.key)!}
                onOpen={setModalTask}
                isOver={draggingOver === c.key}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-1 scale-105 opacity-90 rounded-lg border border-white/25 bg-neutral-900 p-3 shadow-2xl shadow-black/60 text-sm font-medium text-white/90 cursor-grabbing">
                {activeTask.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
