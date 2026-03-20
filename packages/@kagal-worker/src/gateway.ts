import { defu } from 'defu';
import { match, type MatchResult } from 'path-to-regexp';

import { getAgent } from './agent';
import {
  KAGAL_AGENT_PATHS,
  KAGAL_PATHS,
  SUPERVISOR_NAME,
} from './consts';
import { getSupervisor } from './supervisor';
import {
  isMethodAllowed,
  isWebSocketUpgrade,
  joinPath,
  methodNotAllowed,
  notFound,
  notImplemented,
  upgradeRequired,
} from './utils';

import type {
  DeepPartial,
  HealthCheck,
  KagalEnv,
  KagalPaths,
} from './types';

/** Configuration for the KagalGateway. */
export interface KagalGatewayConfig {
  paths?: DeepPartial<KagalPaths>
}

type RouteHandler = (
  matched: MatchResult,
  request: Request,
  env: KagalEnv,
) => Promise<Response>;

interface AgentParams {
  id: string
}

interface RouteEntry {
  path: string
  methods: string[]
  handler: RouteHandler
}

interface Route {
  match: (path: string) => false | MatchResult
  methods: string[]
  handler: RouteHandler
}

/** HTTP-to-RPC gateway for Kagal Durable Objects.
 *  Compiles routes from {@link KagalPaths} at
 *  construction time and dispatches requests to
 *  Agent and Supervisor DOs via RPC. Serves the
 *  paths directory as JSON at `/`. */
export class KagalGateway {
  readonly paths: KagalPaths;
  private readonly routes: Route[];

  constructor(config: KagalGatewayConfig = {}) {
    this.paths = defu(config.paths, KAGAL_PATHS);
    this.routes = this.compile();
  }

  // --- Agent RPC methods ---

  /** RPC: agent health check. */
  async agentHealth(
    env: KagalEnv,
    id: string,
  ): Promise<HealthCheck> {
    return getAgent(env, id).health();
  }

  /** RPC: agent WebSocket upgrade. The request must
   *  carry an `Upgrade: websocket` header. */
  async agentWS(
    request: Request,
    env: KagalEnv,
    id: string,
  ): Promise<Response> {
    if (!isWebSocketUpgrade(request)) {
      return upgradeRequired();
    }
    const internal = new Request(
      new URL(`/${KAGAL_AGENT_PATHS.ws}`, request.url),
      request,
    );
    return getAgent(env, id).fetch(internal);
  }

  /** RPC: agent task queue. Not yet implemented. */
  async agentTasks(
    env: KagalEnv,
    id: string,
  ): Promise<Response> {
    return notImplemented(env, id);
  }

  /** RPC: claim a quarantined agent.
   *  Not yet implemented. */
  async agentClaim(
    env: KagalEnv,
    id: string,
  ): Promise<Response> {
    return notImplemented(env, id);
  }

  /** RPC: agent data tunnel. Not yet implemented. */
  async agentTunnel(
    request: Request,
    env: KagalEnv,
    id: string,
  ): Promise<Response> {
    return notImplemented(request, env, id);
  }

  // --- Supervisor RPC methods ---

  /** RPC: supervisor health check. */
  async supervisorHealth(
    env: KagalEnv,
  ): Promise<HealthCheck> {
    return getSupervisor(env, SUPERVISOR_NAME).health();
  }

  /** RPC: list registered agents.
   *  Not yet implemented. */
  async supervisorAgents(
    env: KagalEnv,
  ): Promise<Response> {
    return notImplemented(env);
  }

  /** RPC: agent self-registration.
   *  Not yet implemented. */
  async supervisorRegister(
    env: KagalEnv,
  ): Promise<Response> {
    return notImplemented(env);
  }

  // --- Route compilation ---

  private compile(): Route[] {
    const { paths } = this;
    const ap = `/${paths.agentsPrefix}`;
    const sp = `/${paths.supervisorPrefix}`;

    const agent = (sub: string) => joinPath(ap, sub);
    const sup = (sub: string) => joinPath(sp, sub);

    const entries: RouteEntry[] = [
      // Agent routes
      {
        path: agent(paths.agents.health),
        methods: ['GET', 'HEAD'],
        handler: async (matched, _request, env) => {
          const { id } = matched.params as AgentParams;
          return Response.json(
            await this.agentHealth(env, id),
          );
        },
      },
      {
        path: agent(paths.agents.ws),
        methods: ['GET', 'HEAD'],
        handler: async (matched, request, env) => {
          const { id } = matched.params as AgentParams;
          return this.agentWS(request, env, id);
        },
      },
      {
        path: agent(paths.agents.tasks),
        methods: ['GET', 'HEAD', 'POST'],
        handler: async (matched, _request, env) => {
          const { id } = matched.params as AgentParams;
          return this.agentTasks(env, id);
        },
      },
      {
        path: agent(paths.agents.claim),
        methods: ['POST'],
        handler: async (matched, _request, env) => {
          const { id } = matched.params as AgentParams;
          return this.agentClaim(env, id);
        },
      },
      {
        path: agent(paths.agents.tunnel),
        methods: ['GET', 'HEAD'],
        handler: async (matched, request, env) => {
          const { id } = matched.params as AgentParams;
          return this.agentTunnel(request, env, id);
        },
      },

      // Supervisor routes
      {
        path: sup(paths.supervisor.health),
        methods: ['GET', 'HEAD'],
        handler: async (_matched, _request, env) =>
          Response.json(await this.supervisorHealth(env)),
      },
      {
        path: sup(paths.supervisor.agents),
        methods: ['GET', 'HEAD'],
        handler: async (_matched, _request, env) =>
          this.supervisorAgents(env),
      },
      {
        path: sup(paths.supervisor.register),
        methods: ['POST'],
        handler: async (_matched, _request, env) =>
          this.supervisorRegister(env),
      },
    ];

    return entries.map(({ path, methods, handler }) => ({
      match: match(path),
      methods,
      handler,
    }));
  }

  // TODO: kagalAuth — authenticate and authorise
  // the request before dispatching to DOs.
  // See DESIGN.md TBD #2 (kagalAuth Middleware Contract).

  // TODO: built-in OPTIONS handling.

  async fetch(
    request: Request,
    env: KagalEnv,
  ): Promise<Response> {
    const { pathname } = new URL(request.url);
    const { method } = request;

    // Discovery: return the paths directory.
    if (pathname === '/') {
      if (!isMethodAllowed(method, ['GET', 'HEAD'])) {
        return methodNotAllowed('GET', 'HEAD');
      }
      return Response.json(this.paths);
    }

    for (const route of this.routes) {
      const result = route.match(pathname);
      if (result) {
        if (!isMethodAllowed(method, route.methods)) {
          return methodNotAllowed(...route.methods);
        }
        return route.handler(result, request, env);
      }
    }

    return notFound();
  }
}
