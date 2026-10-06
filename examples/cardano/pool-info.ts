import { adaGet, getValue, pickPoolId } from './_blockfrost.ts';

const poolId = getValue() ?? (await pickPoolId());
const pool = await adaGet(`/pools/${poolId}`);

console.log(JSON.stringify(pool, null, 2));
