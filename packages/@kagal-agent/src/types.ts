export interface KagalConnectConfig {
  serverURL: string
  agentID: string
  certPath: string
  keyPath: string
}

export type TaskHandler = (
  params: Record<string, unknown>,
) => Promise<Record<string, unknown>>;
