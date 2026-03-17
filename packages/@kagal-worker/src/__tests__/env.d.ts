import type { KagalEnv } from '@kagal/worker';

declare global {
  namespace Cloudflare {
    // Must be an interface (not a type alias) for declaration
    // merging with the Cloudflare.Env declared by cloudflare:test.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Env extends KagalEnv {}
  }
}
