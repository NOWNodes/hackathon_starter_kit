import { solanaRpc } from './_rpc';

const signature = process.argv[2];

if (!signature) {
  throw new Error('Usage: npm exec tsx examples/solana/transaction-lookup.ts <SIGNATURE>');
}

const transaction = await solanaRpc<any>('getTransaction', [
  signature,
  {
    encoding: 'jsonParsed',
    maxSupportedTransactionVersion: 0,
  },
]);

console.log(`Signature: ${signature}`);
console.log(`Slot: ${transaction?.slot ?? 'not found'}`);
console.log(`Fee: ${transaction?.meta?.fee ?? 'not found'}`);
console.log(`Status: ${JSON.stringify(transaction?.meta?.err ?? 'ok')}`);
console.log(JSON.stringify(transaction, null, 2));
