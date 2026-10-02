import { ethRpc, formatUnits, hexToBigInt } from './_rpc';

const gasPriceHex = await ethRpc<string>('eth_gasPrice');
let maxPriorityFeePerGasHex: string | null = null;

try {
  maxPriorityFeePerGasHex = await ethRpc<string>('eth_maxPriorityFeePerGas');
} catch {
  maxPriorityFeePerGasHex = null;
}

const gasPriceWei = hexToBigInt(gasPriceHex);
const priorityFeeWei = maxPriorityFeePerGasHex ? hexToBigInt(maxPriorityFeePerGasHex) : null;

console.log(
  JSON.stringify(
    {
      gasPriceWei: gasPriceWei.toString(),
      gasPriceGwei: formatUnits(gasPriceWei, 9),
      maxPriorityFeePerGasWei: priorityFeeWei?.toString() ?? null,
      maxPriorityFeePerGasGwei: priorityFeeWei ? formatUnits(priorityFeeWei, 9) : null,
    },
    null,
    2,
  ),
);
