"use client";

import { useMemo, useState } from "react";
import type { ProjectNode } from "@/lib/notion/projects";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";

export type FlatProject = {
  id: string;
  name: string;
  pillar?: string;
  level?: string;
  parentId?: string;
  quickSummary?: string;
  appUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  url?: string;
};

function flatten(nodes: ProjectNode[]): FlatProject[] {
  const out: FlatProject[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift()!;
    out.push({
      id: n.id,
      name: n.name,
      pillar: n.pillar,
      level: n.level,
      parentId: n.parentId,
      quickSummary: n.quickSummary,
      appUrl: n.appUrl,
      repoUrl: n.repoUrl,
      docsUrl: n.docsUrl,
      url: n.url,
    });
    for (const c of n.children) stack.push(c);
  }
  return out;
}

export function ProjectExplorer({
  parents,
  dbLabel,
}: {
  parents: ProjectNode[];
  dbLabel: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const allProjects = useMemo(() => flatten(parents), [parents]);
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
        <ProjectModal
          project={selected}
          dbLabel={dbLabel}
          projects={allProjects}
          pillarOptions={pillarOptions}
          levelOptions={levelOptions}
          onClose={() => setOpenId(null)}
          onProjectPatched={(next) => {
            // Keep the modal open on the same project.
            setOpenId(next.id);
          }}
        />
      )}
    </div>
  );
}
