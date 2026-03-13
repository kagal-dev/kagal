import type { KagalAuthResult, KagalServerConfig, KagalServerEnv } from './types';

export function kagalAuth<
  E extends KagalServerEnv = KagalServerEnv,
>(
  request: Request,
  env: E,
  config?: KagalServerConfig,
): KagalAuthResult | undefined {
  void request;
  void env;
  void config;
  // TODO: implement mTLS identity resolution
  return undefined;
}
