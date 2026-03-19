import { notionQueryDatabase, requireEnv } from "@/lib/notion/client";

export type CronRow = {
  id: string;
  name: string;
  lastRun?: string;
  nextRun?: string;
  lastStatus?: string;
};

function plainTitle(prop: any): string {
  const t = prop?.title ?? [];
  return t.map((x: any) => x.plain_text).join("").trim();
}

function selectName(prop: any): string | undefined {
  const s = prop?.select;
  return s?.name;
}

function dateStart(prop: any): string | undefined {
  const d = prop?.date;
  return d?.start;
}

export async function getCronMonitorRows(): Promise<CronRow[]> {
  const db = requireEnv("NOTION_CRON_DB");

  const res = await notionQueryDatabase(db, {
    page_size: 200,
    sorts: [{ property: "Name", direction: "ascending" }],
  });

  return res.results.map((page: any) => {
    const props = page.properties ?? {};
    return {
      id: page.id,
      name: plainTitle(props.Name) || "(unnamed)",
      lastRun: dateStart(props["Last Run"]),
      nextRun: dateStart(props["Next Run"]),
      lastStatus: selectName(props["Last Status"]),
    };
  });
}

export function summarizeCronRows(rows: CronRow[]) {
  const total = rows.length;
  const ok = rows.filter((r) => (r.lastStatus ?? "").toLowerCase() === "ok").length;
  const error = rows.filter((r) => (r.lastStatus ?? "").toLowerCase() === "error").length;
  return { total, ok, error };
}
