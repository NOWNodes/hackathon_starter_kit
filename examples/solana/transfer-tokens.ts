import { solanaRpc } from './_rpc';

const owner = process.argv[2];
const mint = process.argv[3];

if (!owner || !mint) {
  throw new Error('Usage: npm exec tsx examples/solana/transfer-tokens.ts <OWNER_PUBLIC_KEY> <TOKEN_MINT>');
}

const accounts = await solanaRpc<any>('getTokenAccountsByOwner', [
  owner,
  {
    mint,
  },
  {
    encoding: 'jsonParsed',
  },
]);

console.log(`Owner: ${owner}`);
console.log(`Mint: ${mint}`);
console.log(JSON.stringify(accounts, null, 2));
console.log('Use a wallet/client to sign the token transfer, then verify with transaction-lookup.ts.');
