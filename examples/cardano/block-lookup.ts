import { adaGet, getValue, requireArg } from './_blockfrost.ts';

const blockId = requireArg(
  getValue(),
  'Usage: npm exec -- tsx examples/cardano/block-lookup.ts <BLOCK_HASH_OR_HEIGHT>',
);
const block = await adaGet(`/blocks/${blockId}`);

console.log(JSON.stringify(block, null, 2));
