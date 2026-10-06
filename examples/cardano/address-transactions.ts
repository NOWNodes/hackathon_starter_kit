import { adaGet, getNumberFlag, getValue, pickRecentAddress } from './_blockfrost.ts';

const address = getValue() ?? (await pickRecentAddress());
const count = Math.min(getNumberFlag('count', 10), 100);
const page = getNumberFlag('page', 1);
const transactions = await adaGet(`/addresses/${address}/transactions`, { count, page, order: 'desc' });

console.log(JSON.stringify({ address, count, page, transactions }, null, 2));
