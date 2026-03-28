import "server-only";

import { openclawRpc } from "@/lib/openclaw/rpc";

export type LiveSession = {
  key: string;
  label?: string;
  agentId?: string;
  kind?: string;
  model?: string;
  ageLabel?: string;
  tokensLabel?: string;
};

type SessionsListResponse = {
  sessions?: Array<{
    key?: string;
    sessionKey?: string;
    id?: string;
    label?: string;
    agentId?: string;
    kind?: string;
    model?: string;
    age?: string;
    tokens?: string;
  }>;
};

function pickKey(s: any): string {
  return String(s?.key ?? s?.sessionKey ?? s?.id ?? "").trim();
}

export async function getLiveSessions({
  activeMinutes = 120,
  limit = 50,
}: {
  activeMinutes?: number;
  limit?: number;
} = {}): Promise<LiveSession[]> {
  const wsUrl = process.env.OPENCLAW_GATEWAY_WS_URL ?? process.env.OPENCLAW_GATEWAY_URL;
  if (!wsUrl) return [];

  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  const origin = process.env.OPENCLAW_CONTROL_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL;

  // Ensure ws/wss scheme + correct websocket path.
  let ws = wsUrl.startsWith("http") ? wsUrl.replace(/^http/, "ws") : wsUrl;
  ws = ws.replace(/\/$/, "");
  if (!ws.endsWith("/ws")) ws = ws + "/ws";

  const res = await openclawRpc<SessionsListResponse>(
    "sessions.list",
    { activeMinutes, limit, messageLimit: 0 },
    {
      wsUrl: ws,
      token,
      origin: origin?.replace(/\/$/, ""),
      timeoutMs: 8000,
    }
  );

  const sessions = Array.isArray(res?.sessions) ? res.sessions : [];

  return sessions
    .map((s) => {
      const key = pickKey(s);
      return {
        key,
        label: s.label,
        agentId: s.agentId,
        kind: s.kind,
        model: s.model,
        ageLabel: s.age,
        tokensLabel: s.tokens,
      };
    })
    .filter((s) => s.key.length > 0);
}
