import { adaGet, getValue, pickRecentTxHash } from './_blockfrost.ts';

const txHash = getValue() ?? (await pickRecentTxHash());
const metadata = await adaGet(`/txs/${txHash}/metadata`);

console.log(JSON.stringify({ txHash, metadata }, null, 2));
