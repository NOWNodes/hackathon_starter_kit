import { solanaRpc } from './_rpc';

const account = process.argv[2];

if (!account) {
  throw new Error('Usage: npm exec tsx examples/solana/account-data-viewer.ts <ACCOUNT_PUBLIC_KEY>');
}

const info = await solanaRpc<any>('getAccountInfo', [
  account,
  {
    encoding: 'base64',
  },
]);

const value = info.value;
if (!value) {
  console.log('Account not found.');
  process.exit(0);
}

const data = Buffer.from(value.data[0], 'base64');

console.log(
  JSON.stringify(
    {
      account,
      owner: value.owner,
      executable: value.executable,
      lamports: value.lamports,
      dataLength: data.length,
      base64: value.data[0],
      hexPreview: data.subarray(0, 64).toString('hex'),
    },
    null,
    2,
  ),
);
