import { describe, expect, it } from 'vitest';

import {
  isMethodAllowed,
  isWebSocketUpgrade,
  joinPath,
  methodNotAllowed,
  notFound,
  notImplemented,
  upgradeRequired,
} from '../utils';

describe('joinPath', () => {
  it('joins prefix and bare sub-path', () => {
    expect(joinPath('agent/:id', 'health'))
      .toBe('agent/:id/health');
  });

  it('returns absolute sub-path as-is', () => {
    expect(joinPath('agent/:id', '/custom'))
      .toBe('/custom');
  });

  it('handles empty prefix', () => {
    expect(joinPath('', 'health')).toBe('health');
  });

  it('handles prefix without params', () => {
    expect(joinPath('supervisor', 'agents'))
      .toBe('supervisor/agents');
  });

  it('collapses duplicate slashes in prefix', () => {
    expect(joinPath('agent/', 'health'))
      .toBe('agent/health');
  });

  it('collapses trailing slash at the join boundary', () => {
    expect(joinPath('agent/:id/', 'health'))
      .toBe('agent/:id/health');
  });
});

describe('isWebSocketUpgrade', () => {
  it('returns true for lowercase websocket', () => {
    const request = new Request('http://x/', {
      headers: { upgrade: 'websocket' },
    });
    expect(isWebSocketUpgrade(request)).toBe(true);
  });

  it('returns true for mixed-case WebSocket', () => {
    const request = new Request('http://x/', {
      headers: { upgrade: 'WebSocket' },
    });
    expect(isWebSocketUpgrade(request)).toBe(true);
  });

  it('returns false without upgrade header', () => {
    const request = new Request('http://x/');
    expect(isWebSocketUpgrade(request)).toBe(false);
  });
});

describe('isMethodAllowed', () => {
  it('matches an exact method', () => {
    expect(isMethodAllowed('GET', ['GET'])).toBe(true);
    expect(isMethodAllowed('POST', ['GET', 'POST'])).toBe(true);
  });

  it('rejects an unlisted method', () => {
    expect(isMethodAllowed('DELETE', ['GET', 'POST'])).toBe(false);
  });

  it('accepts HEAD wherever GET is allowed', () => {
    expect(isMethodAllowed('HEAD', ['GET'])).toBe(true);
  });

  it('rejects HEAD when only POST is allowed', () => {
    expect(isMethodAllowed('HEAD', ['POST'])).toBe(false);
  });
});

describe('notFound', () => {
  it('returns 404', () => {
    expect(notFound().status).toBe(404);
  });
});

describe('methodNotAllowed', () => {
  it('returns 405 with Allow header', () => {
    const response = methodNotAllowed('GET', 'POST');
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, POST');
  });
});

describe('upgradeRequired', () => {
  it('returns 426', () => {
    expect(upgradeRequired().status).toBe(426);
  });
});

describe('notImplemented', () => {
  it('returns 501', () => {
    expect(notImplemented().status).toBe(501);
  });

  it('accepts and discards arguments', () => {
    expect(notImplemented('a', 'b', 'c').status).toBe(501);
  });
});
