import { QuickAdd } from "@/components/tasks/QuickAdd";
import { ChronoCountdown } from "@/components/ornaments/ChronoCountdown";
import { TasksWorkspace } from "@/components/tasks/TasksWorkspace";
import { getTasksForBoard } from "@/lib/notion/tasks";
import { getProjectsTreeForDb } from "@/lib/notion/projects";

function flattenProjects(parents: any[]): Array<{ id: string; name: string }> {
  const out: Array<{ id: string; name: string }> = [];
  const stack = [...parents];
  while (stack.length) {
    const n = stack.shift();
    out.push({ id: n.id, name: n.name });
    for (const c of n.children ?? []) stack.push(c);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks, projectsTree] = await Promise.all([
    getTasksForBoard(),
    process.env.NOTION_PROJECTS_DB ? getProjectsTreeForDb(process.env.NOTION_PROJECTS_DB).catch(() => null) : Promise.resolve(null),
  ]);

  const projects = projectsTree ? flattenProjects(projectsTree.parents) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-white/60">Mission Control is the editor. Notion is storage.</p>
        </div>
      </div>

      <ChronoCountdown />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <QuickAdd projects={projects} />
        </div>
        <a
          href="/ideas"
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/60 hover:border-white/20 hover:text-white/80"
        >
          Ideas ↗
        </a>
      </div>
      <TasksWorkspace tasks={tasks} projects={projects} />
    </div>
  );
}

