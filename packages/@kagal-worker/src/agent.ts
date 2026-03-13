import { DurableObject } from 'cloudflare:workers';

import type { KagalEnv } from './types';

export class KagalAgent extends DurableObject<KagalEnv> {
  // TODO: WebSocket hibernation, nonce chain, task queue
}
