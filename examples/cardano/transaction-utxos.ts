import { adaGet, getValue, pickRecentTxHash } from './_blockfrost.ts';

const txHash = getValue() ?? (await pickRecentTxHash());
const utxos = await adaGet(`/txs/${txHash}/utxos`);

console.log(JSON.stringify({ txHash, utxos }, null, 2));
