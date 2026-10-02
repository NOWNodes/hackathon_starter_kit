import { btcBook, btcRpc, requireArg, satsToBtc } from './_rpc';

const blockId = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/block-fee-summary.ts <BLOCK_HEIGHT_OR_HASH>',
);

let feeStats: any = null;
try {
  feeStats = await btcBook<any>(`/api/v2/feestats/${encodeURIComponent(blockId)}`);
} catch (error: any) {
  feeStats = { error: error.message };
}

const blockHash = /^\d+$/.test(blockId) ? await btcRpc<string>('getblockhash', [Number(blockId)]) : blockId;
const block = await btcRpc<any>('getblock', [blockHash, 2]);
const feesBtc = (block.tx ?? [])
  .map((tx: any) => tx.fee)
  .filter((fee: unknown): fee is number => typeof fee === 'number');
const totalFeeSats = feesBtc.reduce((sum: bigint, fee: number) => sum + BigInt(Math.round(fee * 100_000_000)), 0n);

console.log(
  JSON.stringify(
    {
      hash: block.hash,
      height: block.height,
      transactionCount: block.nTx,
      totalFeeBtc: satsToBtc(totalFeeSats),
      averageFeeBtc: feesBtc.length > 0 ? Number(satsToBtc(totalFeeSats) ?? 0) / feesBtc.length : null,
      blockbookFeeStats: feeStats,
    },
    null,
    2,
  ),
);
