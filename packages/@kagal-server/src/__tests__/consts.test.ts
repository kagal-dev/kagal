import { describe, expect, it } from 'vitest';

import {
  KAGAL_ROLES,
} from '../index';

describe('constants', () => {
  it('exports KAGAL_ROLES', () => {
    expect(KAGAL_ROLES).toContain('agent');
    expect(KAGAL_ROLES).toContain('operator');
  });
});
