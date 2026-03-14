// Mock for cloudflare:workers in vitest (Node.js) environment
export class DurableObject {
  ctx: unknown;
  env: unknown;

  constructor(context: unknown, env: unknown) {
    this.ctx = context;
    this.env = env;
  }
}
