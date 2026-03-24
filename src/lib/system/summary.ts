import { getGatewayHealth } from "@/lib/openclaw/health";
import { getSkillsInventory } from "@/lib/notion/skills";

export type SystemSummary = {
  vercelCommit?: string;
  gateway: {
    ok: boolean;
    status?: string;
    url?: string;
  };
  notion: {
    ok: boolean;
    configured: {
      tasks: boolean;
      projects: boolean;
      content: boolean;
      cron: boolean;
      opsEvents: boolean;
    };
  };
  skills: {
    count: number;
    sample: string[];
  };
};

export async function getSystemSummary(): Promise<SystemSummary> {
  const gw = await getGatewayHealth();

  // Notion env keys (just config presence; deeper health checks can be added later).
  const configured = {
    tasks: Boolean(process.env.NOTION_TASKS_DB),
    projects: Boolean(process.env.NOTION_PROJECTS_DB || process.env.NOTION_PROJECTS_DB_2),
    content: Boolean(process.env.NOTION_CONTENT_DB),
    cron: Boolean(process.env.NOTION_CRON_DB),
    opsEvents: Boolean(process.env.NOTION_OPS_EVENTS_DB),
  };

  let skills: string[] = [];
  try {
    const rows = await getSkillsInventory(50);
    skills = rows.map((r) => r.name);
  } catch {
    // ignore
  }

  const vercelCommit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    undefined;

  return {
    vercelCommit,
    gateway: { ok: gw.ok, status: gw.status, url: gw.url },
    notion: {
      ok: Boolean(process.env.NOTION_API_KEY),
      configured,
    },
    skills: {
      count: skills.length,
      sample: skills.slice(0, 12),
    },
  };
}
