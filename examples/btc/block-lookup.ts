import { btcRpc, requireArg } from './_rpc';

const input = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/block-lookup.ts <BLOCK_HEIGHT_OR_HASH> [--full]',
);
const fullTransactions = process.argv.includes('--full');

const blockHash = /^\d+$/.test(input) ? await btcRpc<string>('getblockhash', [Number(input)]) : input;
const verbosity = fullTransactions ? 2 : 1;
const block = await btcRpc<any>('getblock', [blockHash, verbosity]);
const transactions = block.tx ?? [];

console.log(
  JSON.stringify(
    {
      hash: block.hash,
      height: block.height,
      confirmations: block.confirmations,
      time: new Date(block.time * 1000).toISOString(),
      transactionCount: transactions.length,
      size: block.size,
      weight: block.weight,
      merkleRoot: block.merkleroot,
      previousBlockHash: block.previousblockhash ?? null,
      nextBlockHash: block.nextblockhash ?? null,
      sampleTransactions: transactions.slice(0, 5).map((tx: any) =>
        typeof tx === 'string'
          ? tx
          : {
              txid: tx.txid,
              vin: tx.vin?.length ?? 0,
              vout: tx.vout?.length ?? 0,
              totalOutputBtc: (tx.vout ?? []).reduce((sum: number, output: any) => sum + output.value, 0),
            },
      ),
      mode: fullTransactions ? 'decoded-transactions' : 'txids',
    },
    null,
    2,
  ),
);
