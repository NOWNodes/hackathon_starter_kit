import { decodeAbiString, decodeUint, ethCall, normalizeAddress } from './_rpc';

const contract = process.argv[2];

if (!contract) {
  throw new Error('Usage: npm exec tsx examples/eth/erc721-contract-info.ts <ERC721_CONTRACT>');
}

const contractAddress = normalizeAddress(contract);

async function optionalCall(data: string): Promise<string | null> {
  try {
    return await ethCall(contractAddress, data);
  } catch {
    return null;
  }
}

function decodeBool(hex: string | null): boolean | null {
  if (!hex) return null;
  return decodeUint(hex) === 1n;
}

const [nameRaw, symbolRaw, erc721SupportRaw, erc721MetadataSupportRaw] = await Promise.all([
  optionalCall('0x06fdde03'),
  optionalCall('0x95d89b41'),
  optionalCall('0x01ffc9a780ac58cd00000000000000000000000000000000000000000000000000000000'),
  optionalCall('0x01ffc9a75b5e139f00000000000000000000000000000000000000000000000000000000'),
]);

console.log(
  JSON.stringify(
    {
      contract: contractAddress,
      name: nameRaw ? decodeAbiString(nameRaw) : null,
      symbol: symbolRaw ? decodeAbiString(symbolRaw) : null,
      supportsErc721: decodeBool(erc721SupportRaw),
      supportsErc721Metadata: decodeBool(erc721MetadataSupportRaw),
    },
    null,
    2,
  ),
);
