import { solanaRpc } from './_rpc';

const feedAccount = process.argv[2];

if (!feedAccount) {
  throw new Error('Usage: npm exec tsx examples/solana/chainlink-read-data.ts <CHAINLINK_FEED_ACCOUNT>');
}

const account = await solanaRpc<any>('getAccountInfo', [
  feedAccount,
  {
    encoding: 'base64',
  },
]);

console.log(
  JSON.stringify(
    {
      feedAccount,
      owner: account.value?.owner,
      lamports: account.value?.lamports,
      dataLength: account.value ? Buffer.from(account.value.data[0], 'base64').length : 0,
      raw: account,
    },
    null,
    2,
  ),
);
