import { getTasksForBoard } from "@/lib/notion/tasks";

export type ActivityItem = {
  id: string;
  title: string;
  time: string;
  color: string;
};

export async function getActivityFeed(): Promise<{ items: ActivityItem[] }> {
  // Notion Activity rail should show *work* activity (tasks/projects/content),
  // not ops/cron logs (those live on /ops + dashboard highlights).

  let tasks = [] as Awaited<ReturnType<typeof getTasksForBoard>>;
  try {
    tasks = await getTasksForBoard();
  } catch {
    // env not configured
  }


  const taskItems: ActivityItem[] = tasks.slice(0, 10).map((t) => ({
    id: `task:${t.id}`,
    title: `Task updated: ${t.title}`,
    time: t.updatedAtLabel,
    color: (t.status ?? "").toLowerCase() === "done" ? "#22c55e" : "#60a5fa",
  }));

  const items = [...taskItems].slice(0, 12);

  if (items.length === 0) {
    items.push({
      id: "placeholder",
      title: "Configure NOTION_API_KEY + DB IDs to see live activity",
      time: "now",
      color: "#f59e0b",
    });
  }

  return { items };
}
