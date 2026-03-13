import { createKagalRouter } from '@kagal/server';

import type { KagalServerEnv } from '@kagal/server';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

const kagal = createKagalRouter<Env>();

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> {
    const response = await kagal.handle(request, env, context);
    if (response) return response;

    if (new URL(request.url).pathname === '/api/health') {
      return Response.json({ status: 'ok', fleet: env.FLEET_NAME });
    }

    return new Response('Not Found', { status: 404 });
  },
};
