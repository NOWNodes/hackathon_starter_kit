import { adaGet, getValue, pickRecentAssetUnit } from './_blockfrost.ts';

const asset = getValue() ?? (await pickRecentAssetUnit());
const info = await adaGet(`/assets/${asset}`);

console.log(JSON.stringify(info, null, 2));
