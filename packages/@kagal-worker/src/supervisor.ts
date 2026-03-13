import { DurableObject } from 'cloudflare:workers';

import type { KagalEnv } from './types';

export class KagalSupervisor extends DurableObject<KagalEnv> {
  // TODO: fleet coordination
}
