import { getCronMonitorRows } from "@/lib/notion/crons";
import { getOpsEvents } from "@/lib/notion/opsEvents";
import { getTasksForBoard } from "@/lib/notion/tasks";

export type ActivityItem = {
  id: string;
  title: string;
  time: string;
  color: string;
};

export async function getActivityFeed(): Promise<{ items: ActivityItem[] }> {
  // Derive a "good enough" activity stream from:
  // - recent Notion task edits
  // - cron monitor last status / last run
  // Next: a dedicated Ops Events db (cron announcements + telegram excerpts).

  let tasks = [] as Awaited<ReturnType<typeof getTasksForBoard>>;
  try {
    tasks = await getTasksForBoard();
  } catch {
    // env not configured
  }

  let crons = [] as Awaited<ReturnType<typeof getCronMonitorRows>>;
  try {
    crons = await getCronMonitorRows();
  } catch {
    // env not configured
  }

  let opsEvents = [] as Awaited<ReturnType<typeof getOpsEvents>>;
  try {
    opsEvents = await getOpsEvents(8);
  } catch {
    // env not configured
  }

  const taskItems: ActivityItem[] = tasks.slice(0, 10).map((t) => ({
    id: `task:${t.id}`,
    title: `Task updated: ${t.title}`,
    time: t.updatedAtLabel,
    color: (t.status ?? "").toLowerCase() === "done" ? "#22c55e" : "#60a5fa",
  }));

  // Grab the 5 most recently-run cron jobs.
  const cronItems: ActivityItem[] = crons
    .filter((c) => c.lastRun)
    .slice()
    .sort((a, b) => (b.lastRun ?? "").localeCompare(a.lastRun ?? ""))
    .slice(0, 5)
    .map((c) => {
      const st = (c.lastStatus ?? "").toLowerCase();
      const tone = st === "error" ? "#ef4444" : st === "ok" ? "#22c55e" : "#f59e0b";
      const label = st ? st.toUpperCase() : "UNKNOWN";
      return {
        id: `cron:${c.id}`,
        title: `Cron ${label}: ${c.name}`,
        time: c.lastRun ?? "",
        color: tone,
      };
    });

  const opsItems: ActivityItem[] = opsEvents.slice(0, 6).map((e) => {
    const lvl = (e.level ?? "").toLowerCase();
    const tone = lvl === "error" ? "#ef4444" : lvl === "ok" ? "#22c55e" : lvl === "warn" ? "#f59e0b" : "#a78bfa";
    const src = (e.source ?? "ops").toUpperCase();
    const headline = e.jobName ? `${e.jobName}` : e.name;
    const msg = e.message ? ` — ${e.message}` : "";
    return {
      id: `ops:${e.id}`,
      title: `${src}: ${headline}${msg}`,
      time: e.time ?? "",
      color: tone,
    };
  });

  const items = [...opsItems, ...cronItems, ...taskItems].slice(0, 12);

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
