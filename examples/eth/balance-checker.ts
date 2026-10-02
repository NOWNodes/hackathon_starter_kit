import { ethRpc, formatEther, hexToBigInt, normalizeAddress } from './_rpc';

const address = process.argv[2];
const block = process.argv[3] ?? 'latest';

if (!address) {
  throw new Error('Usage: npm exec tsx examples/eth/balance-checker.ts <ETH_ADDRESS> [BLOCK_TAG]');
}

const normalizedAddress = normalizeAddress(address);
const balanceHex = await ethRpc<string>('eth_getBalance', [normalizedAddress, block]);
const wei = hexToBigInt(balanceHex);

console.log(`Address: ${normalizedAddress}`);
console.log(`Block: ${block}`);
console.log(`Wei: ${wei.toString()}`);
console.log(`ETH: ${formatEther(wei)}`);
