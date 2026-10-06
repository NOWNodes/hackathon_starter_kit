import { adaGet, getNumberFlag, getValue, pickRecentAddress } from './_blockfrost.ts';

const address = getValue() ?? (await pickRecentAddress());
const count = Math.min(getNumberFlag('count', 10), 100);
const page = getNumberFlag('page', 1);
const utxos = await adaGet(`/addresses/${address}/utxos`, { count, page, order: 'desc' });

console.log(JSON.stringify({ address, count, page, utxos }, null, 2));
