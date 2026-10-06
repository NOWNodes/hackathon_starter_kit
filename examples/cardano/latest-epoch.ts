import { adaGet } from './_blockfrost.ts';

const epoch = await adaGet('/epochs/latest');

console.log(JSON.stringify(epoch, null, 2));
