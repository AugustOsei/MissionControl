import { TaskBoard } from "@/components/tasks/TaskBoard";
import { QuickAdd } from "@/components/tasks/QuickAdd";
import { FaceGrid } from "@/components/ornaments/FaceGrid";
import { getTasksForBoard } from "@/lib/notion/tasks";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getTasksForBoard();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-white/60">Notion-backed. Changes sync instantly.</p>
        </div>
      </div>

      <FaceGrid height={200} />
      <QuickAdd />
      <TaskBoard tasks={tasks} />
    </div>
  );
}
