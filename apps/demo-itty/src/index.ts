import { KagalServer } from '@kagal/server';
import { AutoRouter } from 'itty-router';

import type { KagalServerEnv } from '@kagal/server';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

const kagal = new KagalServer<Env>();
const router = AutoRouter();

router.get('/health', async (_request: Request, env: Env) => {
  const result = await kagal.health(env);
  return Response.json(result, { status: result.ok ? 200 : 503 });
});

router.get('/api/health', (_request: Request, env: Env) =>
  Response.json({ status: 'ok', fleet: env.FLEET_NAME }),
);

// Forward to gateway for DO routes
router.all('/*', (request: Request, env: Env) =>
  env.KAGAL_WORKER.fetch(request),
);

export default router;
