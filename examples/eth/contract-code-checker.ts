import { ethRpc, normalizeAddress } from './_rpc';

const address = process.argv[2];
const block = process.argv[3] ?? 'latest';

if (!address) {
  throw new Error('Usage: npm exec tsx examples/eth/contract-code-checker.ts <ETH_ADDRESS> [BLOCK_TAG]');
}

const normalizedAddress = normalizeAddress(address);
const code = await ethRpc<string>('eth_getCode', [normalizedAddress, block]);
const byteLength = code === '0x' ? 0 : (code.length - 2) / 2;

console.log(
  JSON.stringify(
    {
      address: normalizedAddress,
      block,
      type: byteLength > 0 ? 'contract' : 'externally-owned-account',
      byteLength,
      codePreview: byteLength > 0 ? `${code.slice(0, 82)}...` : '0x',
    },
    null,
    2,
  ),
);
