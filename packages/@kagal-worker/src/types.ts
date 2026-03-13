export interface KagalEnv {
  // Required: Durable Object namespace for KagalAgent
  KAGAL_AGENT: DurableObjectNamespace

  // Required: Durable Object namespace for Supervisor
  KAGAL_SUPERVISOR: DurableObjectNamespace

  // Required: KV namespace for agent registry
  AGENT_INDEX: KVNamespace
}

export interface AgentIdentity {
  agent_id: string
  role: 'agent' | 'operator'
  registered_at: string
}

export interface AgentMeta {
  [key: string]: unknown
}

export interface Task {
  task_id: string
  action: string
  params: Record<string, unknown>
  status: 'dispatched' | 'error' | 'ok' | 'queued'
  result?: Record<string, unknown>
  error?: string
  queued_at: string
  dispatched_at?: string
  completed_at?: string
}

export interface KagalHooks {
  onAgentConnect?: (agentID: string, meta: AgentMeta) => Promise<void>
  onAgentDisconnect?: (agentID: string) => Promise<void>
  onAgentError?: (agentID: string, error: Error) => Promise<void>
  onQuarantine?: (agentID: string, reason: string) => Promise<void>
  onClaim?: (agentID: string, claimedBy: string) => Promise<void>
  onTaskResult?: (agentID: string, task: Task) => Promise<void>
  onStatus?: (agentID: string, status: Record<string, unknown>) => Promise<void>
}

export interface KagalWorkerConfig {
  hooks?: KagalHooks
  nonceGracePeriod?: number // Default: 60
}
