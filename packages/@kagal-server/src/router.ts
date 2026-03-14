import type { KagalRouter, KagalServerConfig, KagalServerEnv } from './types';

export function createKagalRouter<
  E extends KagalServerEnv = KagalServerEnv,
>(config?: KagalServerConfig): KagalRouter<E> {
  void config;
  // TODO: implement
  return {
    routes: [],
    handle: async () => undefined,
  };
}
