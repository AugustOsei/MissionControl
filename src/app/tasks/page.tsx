import { QuickAdd } from "@/components/tasks/QuickAdd";
import { ChronoCountdown } from "@/components/ornaments/ChronoCountdown";
import { TasksWorkspace } from "@/components/tasks/TasksWorkspace";
import { getTasksForBoard } from "@/lib/notion/tasks";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getTasksForBoard();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-white/60">Mission Control is the editor. Notion is storage.</p>
        </div>
      </div>

      <ChronoCountdown />
      <QuickAdd />
      <TasksWorkspace tasks={tasks} />
    </div>
  );
}

