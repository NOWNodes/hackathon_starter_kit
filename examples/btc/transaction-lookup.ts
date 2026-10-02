import { btcRpc, formatBtc, requireArg } from './_rpc';

const txid = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/transaction-lookup.ts <TXID> [--block=<BLOCK_HASH>]',
);
const blockHash = process.argv.find((arg) => arg.startsWith('--block='))?.slice('--block='.length);
const params = blockHash ? [txid, true, blockHash] : [txid, true];
const tx = await btcRpc<any>('getrawtransaction', params);

console.log(
  JSON.stringify(
    {
      txid: tx.txid,
      hash: tx.hash,
      blockHash: tx.blockhash ?? blockHash ?? null,
      confirmations: tx.confirmations ?? null,
      size: tx.size,
      vsize: tx.vsize,
      weight: tx.weight,
      version: tx.version,
      locktime: tx.locktime,
      inputCount: tx.vin?.length ?? 0,
      outputCount: tx.vout?.length ?? 0,
      totalOutputBtc: formatBtc((tx.vout ?? []).reduce((sum: number, output: any) => sum + output.value, 0)),
      sampleOutputs: (tx.vout ?? []).slice(0, 5).map((output: any) => ({
        n: output.n,
        valueBtc: formatBtc(output.value),
        type: output.scriptPubKey?.type ?? null,
        address: output.scriptPubKey?.address ?? null,
      })),
    },
    null,
    2,
  ),
);
