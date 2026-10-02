import { solanaRpc } from './_rpc';

const account = process.argv[2];

if (!account) {
  throw new Error('Usage: npm exec tsx examples/solana/counter-read-state.ts <COUNTER_ACCOUNT>');
}

type AccountInfo = {
  value: null | {
    data: [string, 'base64'];
    executable: boolean;
    lamports: number;
    owner: string;
  };
};

const info = await solanaRpc<AccountInfo>('getAccountInfo', [
  account,
  {
    encoding: 'base64',
  },
]);

if (!info.value) {
  console.log('Counter account not found.');
  process.exit(0);
}

const raw = Buffer.from(info.value.data[0], 'base64');
const counter = raw.length >= 8 ? raw.readBigUInt64LE(0).toString() : null;

console.log(
  JSON.stringify(
    {
      account,
      owner: info.value.owner,
      lamports: info.value.lamports,
      bytes: raw.length,
      counter,
    },
    null,
    2,
  ),
);
