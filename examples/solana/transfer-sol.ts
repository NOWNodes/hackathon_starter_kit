import { solanaRpc } from './_rpc';

const signedTransactionBase64 = process.argv[2];

if (!signedTransactionBase64) {
  throw new Error('Usage: npm exec tsx examples/solana/transfer-sol.ts <SIGNED_TRANSACTION_BASE64>');
}

const signature = await solanaRpc<string>('sendTransaction', [
  signedTransactionBase64,
  {
    encoding: 'base64',
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  },
]);

console.log(`Submitted SOL transfer: ${signature}`);
console.log('Verify it with:');
console.log(`npm exec tsx examples/solana/transaction-lookup.ts ${signature}`);
