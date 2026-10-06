import { adaGet, getValue, lovelaceToAda, pickRecentAddress } from './_blockfrost.ts';

const address = getValue() ?? (await pickRecentAddress());
const info: any = await adaGet(`/addresses/${address}`);
const lovelace = info.amount?.find((entry: any) => entry.unit === 'lovelace')?.quantity;

console.log(
  JSON.stringify(
    {
      address: info.address,
      type: info.type,
      stakeAddress: info.stake_address ?? null,
      script: info.script,
      lovelace,
      ada: lovelaceToAda(lovelace),
      assetCount: Math.max((info.amount?.length ?? 0) - 1, 0),
      raw: info,
    },
    null,
    2,
  ),
);
