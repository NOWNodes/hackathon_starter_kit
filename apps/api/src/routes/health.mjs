import { config, hasNownodesConfig } from '../config.mjs';

export function healthRoute() {
  return {
    ok: true,
    service: 'nownodes-multichain-starter',
    nownodesApiKey: hasNownodesConfig() ? 'configured' : 'missing',
    networks: {
      solana: config.solNetwork,
      btc: config.btcNetwork,
      cardano: config.adaNetwork,
    },
  };
}
