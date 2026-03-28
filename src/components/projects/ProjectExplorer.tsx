"use client";

import { useMemo, useState } from "react";
import type { ProjectNode } from "@/lib/notion/projects";
import { ProjectDrawer } from "@/components/projects/ProjectDrawer";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";

export type ProjectStats = {
  notStarted: number;
  doing: number;
  done: number;
  archived: number;
  pct: number; // 0-100
};

export type FlatProject = {
  id: string;
  name: string;
  status?: string;
  priorityBand?: string;
  start?: string;
  due?: string;
  progressMode?: string;
  nextAction?: string;
  pillar?: string;
  level?: string;
  parentId?: string;
  quickSummary?: string;
  appUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  url?: string;
  stats?: ProjectStats;
};

function flatten(nodes: ProjectNode[], statsById?: Record<string, ProjectStats>): FlatProject[] {
  const out: FlatProject[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift()!;
    out.push({
      id: n.id,
      name: n.name,
      status: n.status,
      priorityBand: n.priorityBand,
      start: n.start,
      due: n.due,
      progressMode: n.progressMode,
      nextAction: n.nextAction,
      pillar: n.pillar,
      level: n.level,
      parentId: n.parentId,
      quickSummary: n.quickSummary,
      appUrl: n.appUrl,
      repoUrl: n.repoUrl,
      docsUrl: n.docsUrl,
      url: n.url,
      stats: statsById?.[n.id],
    });
    for (const c of n.children) stack.push(c);
  }
  return out;
}

export function ProjectExplorer({
  parents,
  dbLabel,
  statsById,
}: {
  parents: ProjectNode[];
  dbLabel: string;
  statsById?: Record<string, ProjectStats>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const allProjects = useMemo(() => flatten(parents, statsById), [parents, statsById]);
  const selected = useMemo(
    () => allProjects.find((p) => p.id === openId) ?? null,
    [allProjects, openId],
  );

  const pillarOptions = useMemo(() => {
    const s = new Set<string>();
    for (const p of allProjects) if (p.pillar) s.add(p.pillar);
    return Array.from(s).sort();
  }, [allProjects]);

  const levelOptions = useMemo(() => {
    const s = new Set<string>();
    for (const p of allProjects) if (p.level) s.add(p.level);
    return Array.from(s).sort();
  }, [allProjects]);

  if (parents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/30 font-mono">
        No projects found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProjectsGrid projects={allProjects} onOpen={setOpenId} />

      {selected && (
        <ProjectDrawer
          project={selected}
          dbLabel={dbLabel}
          projects={allProjects}
          pillarOptions={pillarOptions}
          levelOptions={levelOptions}
          onClose={() => setOpenId(null)}
          onProjectPatched={(next) => {
            // Keep the drawer open on the same project.
            setOpenId(next.id);
          }}
        />
      )}
    </div>
  );
}
