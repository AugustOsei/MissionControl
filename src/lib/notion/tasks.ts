import { notionQueryDatabase, requireEnv } from "@/lib/notion/client";

export type Task = {
  id: string;
  title: string;
  status: string;
  priority?: string;
  bucket?: string;
  due?: string;
  assignee?: string;
  projectName?: string;
  projectId?: string;
  summary?: string;
  updatedAt: string;
  updatedAtLabel: string;
  isThisWeek: boolean;
};

function plainTitle(prop: any): string {
  const t = prop?.title ?? [];
  return t.map((x: any) => x.plain_text).join("").trim();
}

function plainRichText(prop: any): string {
  const t = prop?.rich_text ?? [];
  return t.map((x: any) => x.plain_text).join("").trim();
}

function selectName(prop: any): string | undefined {
  const s = prop?.select;
  return s?.name;
}

function statusName(prop: any): string | undefined {
  const s = prop?.status;
  return s?.name;
}

function peopleName(prop: any): string | undefined {
  const p = prop?.people ?? [];
  return p[0]?.name;
}

function dateStart(prop: any): string | undefined {
  return prop?.date?.start;
}

function relationFirstId(prop: any): string | undefined {
  return (prop?.relation ?? [])[0]?.id;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getTasksForBoard(): Promise<Task[]> {
  const db = requireEnv("NOTION_TASKS_DB");

  const res = await notionQueryDatabase(db, {
    page_size: 100,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });

  const weekStart = startOfWeek(new Date());

  return res.results.map((page: any) => {
    const props = page.properties ?? {};

    const titleProp = props.Name || props.Title;
    const statusProp = props.Status;

    const title = plainTitle(titleProp) || "(untitled)";
    const status = statusName(statusProp) || selectName(statusProp) || "Backlog";

    const updatedAt = page.last_edited_time;
    const updatedDate = new Date(updatedAt);

    return {
      id: page.id,
      title,
      status,
      priority: selectName(props.Priority) ?? selectName(props["Priority band"]),
      bucket: selectName(props.Bucket),
      due: dateStart(props.Due),
      assignee: peopleName(props.Assignee),
      projectId: relationFirstId(props.Project),
      projectName: undefined, // resolved client-side where needed
      summary: plainRichText(props.Notes) || plainRichText(props["Status Summary"]),
      updatedAt,
      updatedAtLabel: updatedDate.toISOString().slice(0, 10),
      isThisWeek: updatedDate >= weekStart,
    };
  });
}
