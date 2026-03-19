import { getProjectsTreeForDb } from "@/lib/notion/projects";
import { PROJECT_DATABASES } from "@/lib/notion/databases";
import type { ProjectNode } from "@/lib/notion/projects";

export const dynamic = "force-dynamic";

async function fetchDb(envKey: string) {
  const dbId = process.env[envKey];
  if (!dbId) return null;
  try {
    return await getProjectsTreeForDb(dbId);
  } catch {
    return null;
  }
}

function ProjectTree({ parents }: { parents: ProjectNode[] }) {
  if (parents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/30 font-mono">
        No projects found
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {parents.map((p) => (
        <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-white/90">{p.name}</div>
              {p.pillar && <div className="text-xs text-white/45 font-mono mt-0.5">{p.pillar}</div>}
            </div>
            <div className="text-xs text-white/35 font-mono">{p.children.length} sub</div>
          </div>

          {p.children.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {p.children.map((c) => (
                <div key={c.id} className="rounded-lg border border-white/8 bg-black/30 p-3 hover:border-white/20 transition-colors">
                  <div className="font-medium text-sm text-white/85">{c.name}</div>
                  <div className="text-xs text-white/40 font-mono mt-0.5">
                    {[c.pillar, c.level].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function ProjectsPage() {
  const results = await Promise.all(
    PROJECT_DATABASES.map(async (db) => ({
      ...db,
      tree: await fetchDb(db.envKey),
    }))
  );

  const configured = results.filter((r) => r.tree !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="text-sm text-white/50 font-mono mt-0.5">
          {configured.length} database{configured.length !== 1 ? "s" : ""} · Notion-backed
        </p>
      </div>

      {configured.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-white/40 text-sm font-mono">No project databases configured</div>
          <div className="text-white/25 text-xs font-mono mt-1">Set NOTION_PROJECTS_DB in Vercel env vars</div>
        </div>
      )}

      {configured.map((db) => (
        <div key={db.envKey} className="space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-semibold text-white/90">{db.label}</h2>
              {db.description && (
                <p className="text-xs text-white/40 font-mono">{db.description}</p>
              )}
            </div>
            <div className="flex-1 h-px bg-white/8" />
            <div className="text-[11px] font-mono text-white/25 uppercase tracking-widest">
              {db.envKey}
            </div>
          </div>
          <ProjectTree parents={db.tree!.parents} />
        </div>
      ))}
    </div>
  );
}
