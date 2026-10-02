import { btcRpc } from './_rpc';

const providedTxid = process.argv[2];
const txid = providedTxid ?? (await btcRpc<string[]>('getrawmempool', [false]))[0];

if (!txid) {
  throw new Error('No mempool transaction found. You can pass a txid explicitly.');
}

const entry = await btcRpc<any>('getmempoolentry', [txid]);

console.log(
  JSON.stringify(
    {
      txid,
      vsize: entry.vsize,
      weight: entry.weight,
      time: entry.time ? new Date(entry.time * 1000).toISOString() : null,
      height: entry.height,
      descendantCount: entry.descendantcount,
      ancestorCount: entry.ancestorcount,
      fees: entry.fees ?? null,
      bip125Replaceable: entry['bip125-replaceable'] ?? null,
      spentBy: entry.spentby ?? [],
    },
    null,
    2,
  ),
);
