export interface KagalServerEnv {
  // Required: service binding to the DO Worker
  KAGAL_WORKER: Fetcher
}

export interface KagalServerConfig {
  // Service binding to the DO Worker.
  // Default: env.KAGAL_WORKER
  binding?: string

  // Accept expired but otherwise valid certs.
  // Default: true (offline-resilient)
  allowExpiredCerts?: boolean

  // Extract agent_id from cert subject DN.
  extractAgentID?: (subjectDN: string) => null | string

  // Determine role from cert subject DN.
  extractRole?: (subjectDN: string) => 'agent' | 'operator'
}

export interface KagalRoute<
  E extends KagalServerEnv = KagalServerEnv,
> {
  method: string
  path: string
  handler: (
    request: Request,
    env: E,
    context: ExecutionContext,
  ) => Promise<Response>
}

export interface KagalRouter<
  E extends KagalServerEnv = KagalServerEnv,
> {
  routes: KagalRoute<E>[]
  handle: (
    request: Request,
    env: E,
    context: ExecutionContext,
  ) => Promise<null | Response>
}
