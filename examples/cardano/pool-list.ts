import { adaGet, getNumberFlag } from './_blockfrost.ts';

const count = Math.min(getNumberFlag('count', 10), 100);
const page = getNumberFlag('page', 1);
const pools = await adaGet('/pools', { count, page, order: 'desc' });

console.log(JSON.stringify({ count, page, pools }, null, 2));
