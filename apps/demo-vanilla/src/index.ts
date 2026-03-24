import { KagalServer } from '@kagal/server';

import type { KagalServerEnv } from '@kagal/server';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

const kagal = new KagalServer<Env>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === 'GET' && pathname === '/health') {
      const result = await kagal.health(env);
      return Response.json(result, { status: result.ok ? 200 : 503 });
    }

    if (request.method === 'GET' && pathname === '/api/health') {
      return Response.json({ status: 'ok', fleet: env.FLEET_NAME });
    }

    // Forward to gateway for DO routes
    return env.KAGAL_WORKER.fetch(request);
  },
};
