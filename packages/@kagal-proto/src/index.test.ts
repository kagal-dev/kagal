import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';
import {
  AgentMessageSchema,
  HelloSchema,
  ServerMessageSchema,
  TaskDispatchSchema,
  TaskStatus,
} from './index';

describe('@kagal/proto', () => {
  it('round-trips a ServerMessage with TaskDispatch', () => {
    const msg = create(ServerMessageSchema, {
      payload: {
        case: 'task',
        value: create(TaskDispatchSchema, {
          id: 't-1',
          action: 'reboot',
          params: { fields: {} },
        }),
      },
    });

    const bytes = toBinary(ServerMessageSchema, msg);
    const decoded = fromBinary(ServerMessageSchema, bytes);

    expect(decoded.payload.case).toBe('task');
    expect(decoded.payload.value).toMatchObject({
      id: 't-1',
      action: 'reboot',
      params: { fields: {} },
    });
  });

  it('round-trips an AgentMessage with Hello', () => {
    const msg = create(AgentMessageSchema, {
      payload: {
        case: 'hello',
        value: create(HelloSchema, {
          nonce: 'abc123',
          bootCount: 3,
          hwSerial: 'SN-001',
        }),
      },
    });

    const bytes = toBinary(AgentMessageSchema, msg);
    const decoded = fromBinary(AgentMessageSchema, bytes);

    expect(decoded.payload.case).toBe('hello');
    expect(decoded.payload.value).toMatchObject({
      nonce: 'abc123',
      bootCount: 3,
      hwSerial: 'SN-001',
    });
  });

  it('exports TaskStatus enum values', () => {
    expect(TaskStatus.QUEUED).toBe(1);
    expect(TaskStatus.DISPATCHED).toBe(2);
    expect(TaskStatus.OK).toBe(3);
    expect(TaskStatus.ERROR).toBe(4);
  });
});
