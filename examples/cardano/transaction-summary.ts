import { adaGet, getValue, pickRecentTxHash } from './_blockfrost.ts';

const txHash = getValue() ?? (await pickRecentTxHash());
const tx: any = await adaGet(`/txs/${txHash}`);

console.log(
  JSON.stringify(
    {
      hash: tx.hash,
      block: tx.block,
      blockHeight: tx.block_height,
      slot: tx.slot,
      index: tx.index,
      outputAmount: tx.output_amount,
      fees: tx.fees,
      deposit: tx.deposit,
      size: tx.size,
      invalidBefore: tx.invalid_before ?? null,
      invalidHereafter: tx.invalid_hereafter ?? null,
      raw: tx,
    },
    null,
    2,
  ),
);
