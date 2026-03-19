export type DbConfig = {
  label: string;
  envKey: string;
  description?: string;
};

export const PROJECT_DATABASES: DbConfig[] = [
  {
    label: "OpenClaw Projects",
    envKey: "NOTION_PROJECTS_DB",
    description: "Core OpenClaw project hierarchy",
  },
  {
    label: "Personal Projects",
    envKey: "NOTION_PROJECTS_DB_2",
    description: "Secondary projects database",
  },
];
