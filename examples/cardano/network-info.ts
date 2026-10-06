import { adaGet } from './_blockfrost.ts';

const network = await adaGet('/network');

console.log(JSON.stringify(network, null, 2));
