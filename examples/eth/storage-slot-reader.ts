import { ethRpc, normalizeAddress, padUint } from './_rpc';

const address = process.argv[2];
const slot = process.argv[3];
const block = process.argv[4] ?? 'latest';

if (!address || slot === undefined) {
  throw new Error('Usage: npm exec tsx examples/eth/storage-slot-reader.ts <CONTRACT_ADDRESS> <SLOT_INDEX_OR_HEX> [BLOCK_TAG]');
}

const normalizedAddress = normalizeAddress(address);
const slotHex = slot.startsWith('0x') ? slot : `0x${padUint(slot)}`;
const value = await ethRpc<string>('eth_getStorageAt', [normalizedAddress, slotHex, block]);

console.log(
  JSON.stringify(
    {
      address: normalizedAddress,
      slot: slotHex,
      block,
      value,
      valueAsBigInt: BigInt(value).toString(),
      note: 'For mappings, pass the precomputed keccak256 mapping slot. This example intentionally reads raw storage only.',
    },
    null,
    2,
  ),
);
