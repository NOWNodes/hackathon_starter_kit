import { solanaRpc } from './_rpc';

const address = process.argv[2];
const limit = Number(process.argv[3] ?? 5);

if (!address || !Number.isInteger(limit) || limit < 1 || limit > 1000) {
  throw new Error(
    'Usage: npm exec tsx examples/solana/recent-transactions.ts <ADDRESS> [LIMIT_1_TO_1000]',
  );
}

type SignatureInfo = {
  signature: string;
  slot: number;
  err: null | unknown;
  memo: null | string;
  blockTime: null | number;
  confirmationStatus: null | string;
};

const signatures = await solanaRpc<SignatureInfo[]>('getSignaturesForAddress', [
  address,
  {
    commitment: 'finalized',
    limit,
  },
]);

console.log(`Address: ${address}`);
console.log(`Requested limit: ${limit}`);
console.log(`Transactions found: ${signatures.length}`);
console.log(JSON.stringify(signatures, null, 2));
