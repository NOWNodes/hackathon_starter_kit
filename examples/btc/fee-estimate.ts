import { btcRpc } from './_rpc';

const targetBlocks = Number(process.argv[2] ?? 6);
if (!Number.isInteger(targetBlocks) || targetBlocks < 1 || targetBlocks > 1008) {
  throw new Error('Usage: npm exec tsx examples/btc/fee-estimate.ts [CONFIRMATION_TARGET_1_TO_1008]');
}

const estimate = await btcRpc<any>('estimatesmartfee', [targetBlocks]);

console.log(
  JSON.stringify(
    {
      targetBlocks,
      feeRateBtcPerKvB: estimate.feerate ?? null,
      blocks: estimate.blocks ?? null,
      errors: estimate.errors ?? [],
    },
    null,
    2,
  ),
);
