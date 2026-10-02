import { ethRpc, hexToNumber, normalizeAddress } from './_rpc';

const address = process.argv[2];
const block = process.argv[3] ?? 'latest';

if (!address) {
  throw new Error('Usage: npm exec tsx examples/eth/address-nonce.ts <ETH_ADDRESS> [BLOCK_TAG]');
}

const normalizedAddress = normalizeAddress(address);
const nonceHex = await ethRpc<string>('eth_getTransactionCount', [normalizedAddress, block]);

console.log(
  JSON.stringify(
    {
      address: normalizedAddress,
      block,
      nonceHex,
      nonce: hexToNumber(nonceHex),
    },
    null,
    2,
  ),
);
