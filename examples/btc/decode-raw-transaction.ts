import { btcRpc, ensureHex, getFlag, requireArg, satsToBtc } from './_rpc';

const rawTxHex = ensureHex(
  requireArg(
    process.argv[2],
    'Usage: npm exec -- tsx examples/btc/decode-raw-transaction.ts <RAW_TX_HEX>',
  ),
  'raw transaction hex',
);

const isWitnessFlag = getFlag('iswitness');
const params = isWitnessFlag === undefined ? [rawTxHex] : [rawTxHex, isWitnessFlag === 'true'];
const tx = await btcRpc<any>('decoderawtransaction', params);

console.log(
  JSON.stringify(
    {
      txid: tx.txid,
      hash: tx.hash,
      version: tx.version,
      locktime: tx.locktime,
      size: tx.size,
      vsize: tx.vsize,
      weight: tx.weight,
      inputCount: tx.vin?.length ?? 0,
      outputCount: tx.vout?.length ?? 0,
      totalOutputBtc: satsToBtc((tx.vout ?? []).reduce((sum: bigint, output: any) => {
        const sats = BigInt(Math.round(Number(output.value ?? 0) * 100_000_000));
        return sum + sats;
      }, 0n)),
      sampleOutputs: (tx.vout ?? []).slice(0, 5).map((output: any) => ({
        n: output.n,
        value: output.value,
        type: output.scriptPubKey?.type ?? null,
        address: output.scriptPubKey?.address ?? null,
      })),
    },
    null,
    2,
  ),
);
