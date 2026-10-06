import { getLatestBlock } from './_blockfrost.ts';

const block = await getLatestBlock();

console.log(
  JSON.stringify(
    {
      hash: block.hash,
      height: block.height,
      slot: block.slot ?? null,
      txCount: block.tx_count ?? null,
      raw: block,
    },
    null,
    2,
  ),
);
