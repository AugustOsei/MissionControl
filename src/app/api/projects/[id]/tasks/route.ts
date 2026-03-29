import { notionQueryDatabase, requireEnv } from "@/lib/notion/client";
import { NextResponse } from "next/server";

function plainTitle(prop: any): string {
  const t = prop?.title ?? [];
  return t.map((x: any) => x.plain_text).join("").trim();
}

function selectName(prop: any): string | undefined {
  return prop?.select?.name;
}

function statusName(prop: any): string | undefined {
  return prop?.status?.name;
}

function dateStart(prop: any): string | undefined {
  return prop?.date?.start;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const db = requireEnv("NOTION_TASKS_DB");

  const res = await notionQueryDatabase(db, {
    page_size: 100,
    filter: {
      property: "Project",
      relation: { contains: id },
    },
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });

  const tasks = res.results.map((page: any) => {
    const props = page.properties ?? {};
    const titleProp = props.Name || props.Title;
    const statusProp = props.Status;
    const updatedDate = new Date(page.last_edited_time);

    return {
      id: page.id,
      title: plainTitle(titleProp) || "(untitled)",
      status: statusName(statusProp) || selectName(statusProp) || "Backlog",
      priority: selectName(props.Priority) ?? selectName(props["Priority band"]),
      phase: selectName(props.Phase),
      due: dateStart(props.Due),
      updatedAtLabel: updatedDate.toISOString().slice(0, 10),
    };
  });

  return NextResponse.json({ tasks });
}
