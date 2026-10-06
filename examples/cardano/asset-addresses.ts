import { adaGet, getNumberFlag, getValue, pickRecentAssetUnit } from './_blockfrost.ts';

const asset = getValue() ?? (await pickRecentAssetUnit());
const count = Math.min(getNumberFlag('count', 10), 100);
const page = getNumberFlag('page', 1);
const addresses = await adaGet(`/assets/${asset}/addresses`, { count, page });

console.log(JSON.stringify({ asset, count, page, addresses }, null, 2));
