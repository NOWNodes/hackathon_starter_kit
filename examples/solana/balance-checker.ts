import { lamportsToSol, solanaRpc } from './_rpc';

const address = process.argv[2];

if (!address) {
  throw new Error('Usage: npm exec tsx examples/solana/balance-checker.ts <SOLANA_PUBLIC_KEY>');
}

type BalanceResponse = {
  value: number;
  context: {
    slot: number;
  };
};

const balance = await solanaRpc<BalanceResponse>('getBalance', [address]);

console.log(`Address: ${address}`);
console.log(`Slot: ${balance.context.slot}`);
console.log(`Lamports: ${balance.value}`);
console.log(`SOL: ${lamportsToSol(balance.value)}`);
