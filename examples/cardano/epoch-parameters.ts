import { adaGet, getValue } from './_blockfrost.ts';

const epoch = getValue() ?? 'latest';
const parameters = await adaGet(`/epochs/${epoch}/parameters`);

console.log(JSON.stringify(parameters, null, 2));
