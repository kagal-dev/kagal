/** Join a route prefix and sub-path for internal route
 *  compilation. Collapses duplicate slashes.
 *
 *  Absolute sub-paths (starting with `/`) are returned
 *  as-is. This is a simple string join — for user-facing
 *  URL manipulation, prefer `new URL(path, base)`. */
export function joinPath(
  prefix: string,
  sub: string,
): string {
  if (sub.startsWith('/')) {
    return sub;
  }
  const path = prefix ? `${prefix}/${sub}` : sub;
  return path.replaceAll(/\/{2,}/g, '/');
}

/** Check if a request carries a WebSocket upgrade header.
 *  Comparison is case-insensitive per RFC 7230 §6.7. */
export function isWebSocketUpgrade(request: Request): boolean {
  return request.headers.get('upgrade')?.toLowerCase() === 'websocket';
}

/** Check if a request method matches an allowed set.
 *  HEAD is accepted wherever GET is allowed
 *  per RFC 9110 §9.3.2. */
export function isMethodAllowed(
  method: string,
  allowed: string[],
): boolean {
  if (allowed.includes(method)) return true;
  return method === 'HEAD' && allowed.includes('GET');
}

/** HTTP 404 Not Found response. */
export function notFound(): Response {
  return new Response('not found', { status: 404 });
}

/** HTTP 405 Method Not Allowed response.
 *  Sets the `Allow` header per RFC 9110 §15.5.6. */
export function methodNotAllowed(
  ...methods: string[]
): Response {
  return new Response('method not allowed', {
    status: 405,
    headers: { allow: methods.join(', ') },
  });
}

/** HTTP 426 Upgrade Required response. */
export function upgradeRequired(): Response {
  return new Response('upgrade required', { status: 426 });
}

/** HTTP 501 Not Implemented response.
 *  Accepts and discards arguments so stub methods
 *  can forward their parameters. */
export function notImplemented(
  ...arguments_: unknown[]
): Response {
  void arguments_;
  return new Response('not implemented', { status: 501 });
}
