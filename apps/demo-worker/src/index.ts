export default {
  async fetch(): Promise<Response> {
    return new Response('kagal-do worker', { status: 200 });
  },
};

export { KagalAgent, KagalSupervisor } from '@kagal/worker';
