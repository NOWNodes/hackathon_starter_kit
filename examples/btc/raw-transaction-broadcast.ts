import { btcBookPost, ensureHex, hasFlag, requireArg } from './_rpc';

const rawTxHex = ensureHex(
  requireArg(
    process.argv[2],
    'Usage: npm exec -- tsx examples/btc/raw-transaction-broadcast.ts <SIGNED_RAW_TX_HEX> [--broadcast --yes]',
  ),
  'signed raw transaction hex',
);
const shouldBroadcast = hasFlag('broadcast') && hasFlag('yes');

if (!shouldBroadcast) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        byteLength: rawTxHex.length / 2,
        wouldCall: 'POST https://btcbook.nownodes.io/api/v2/sendtx/',
        note: 'No transaction was broadcast. Add --broadcast --yes to send an already signed raw transaction.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const result = await btcBookPost<any>('/api/v2/sendtx/', rawTxHex);

console.log(
  JSON.stringify(
    {
      mode: 'broadcast',
      result,
    },
    null,
    2,
  ),
);
