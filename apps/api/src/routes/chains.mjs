import { config } from '../config.mjs';

export function chainsRoute() {
  return {
    chains: [
      {
        id: 'solana',
        name: 'Solana',
        network: config.solNetwork,
        rpc: 'NOWNodes',
      },
      {
        id: 'btc',
        name: 'Bitcoin',
        network: config.btcNetwork,
        rpc: 'NOWNodes',
      },
    ],
  };
}
