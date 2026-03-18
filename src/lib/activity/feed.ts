import { getTasksForBoard } from "@/lib/notion/tasks";

export type ActivityItem = {
  id: string;
  title: string;
  time: string;
  color: string;
};

export async function getActivityFeed(): Promise<{ items: ActivityItem[] }> {
  // MVP: derive from recent tasks. Next: add ops + content + real event log.
  let tasks = [] as Awaited<ReturnType<typeof getTasksForBoard>>;
  try {
    tasks = await getTasksForBoard();
  } catch {
    // env not configured yet
  }

  const items: ActivityItem[] = tasks.slice(0, 10).map((t) => ({
    id: t.id,
    title: `Task updated: ${t.title}`,
    time: t.updatedAtLabel,
    color: t.status === "Done" ? "#22c55e" : "#60a5fa",
  }));

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
