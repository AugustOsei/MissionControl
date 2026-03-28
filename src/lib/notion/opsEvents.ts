import { notionQueryDatabase, requireEnv } from "@/lib/notion/client";

export type OpsEvent = {
  id: string;
  name: string;
  time?: string;
  source?: string;
  level?: string;
  jobName?: string;
  message?: string;
  link?: string;
};

function plainTitle(prop: unknown): string {
  const p = prop as { title?: Array<{ plain_text?: string }> };
  const t = p?.title ?? [];
  return t.map((x) => x.plain_text ?? "").join("").trim();
}

function plainRichText(prop: unknown): string {
  const p = prop as { rich_text?: Array<{ plain_text?: string }> };
  const t = p?.rich_text ?? [];
  return t.map((x) => x.plain_text ?? "").join("").trim();
}

function selectName(prop: unknown): string | undefined {
  const p = prop as { select?: { name?: string } };
  return p?.select?.name;
}

function dateStart(prop: unknown): string | undefined {
  const p = prop as { date?: { start?: string } };
  return p?.date?.start;
}

function urlValue(prop: unknown): string | undefined {
  const p = prop as { url?: string };
  return p?.url;
}

export async function getOpsEvents(limit = 25): Promise<OpsEvent[]> {
  const db = requireEnv("NOTION_OPS_EVENTS_DB");
  const res = await notionQueryDatabase(db, {
    page_size: Math.min(100, Math.max(1, limit)),
    sorts: [{ property: "Time", direction: "descending" }],
  });

  return (res.results as Array<any>).map((page) => {
    const props = page.properties ?? {};
    return {
      id: page.id,
      name: plainTitle(props.Name) || "(event)",
      time: dateStart(props.Time),
      source: selectName(props.Source),
      level: selectName(props.Level),
      jobName: plainRichText(props["Job Name"]),
      message: plainRichText(props.Message),
      link: urlValue(props.Link),
    };
  });
}

export async function getLatestOpsEventByName(name: string): Promise<OpsEvent | null> {
  const db = requireEnv("NOTION_OPS_EVENTS_DB");
  const res = await notionQueryDatabase(db, {
    page_size: 1,
    sorts: [{ property: "Time", direction: "descending" }],
    filter: {
      property: "Name",
      title: { equals: name },
    },
  });

  const page = (res.results as Array<any>)[0];
  if (!page) return null;
  const props = page.properties ?? {};
  return {
    id: page.id,
    name: plainTitle(props.Name) || "(event)",
    time: dateStart(props.Time),
    source: selectName(props.Source),
    level: selectName(props.Level),
    jobName: plainRichText(props["Job Name"]),
    message: plainRichText(props.Message),
    link: urlValue(props.Link),
  };
}
