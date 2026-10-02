import { decodeAddress, ethCall, normalizeAddress, padUint } from './_rpc';

const contract = process.argv[2];
const tokenId = process.argv[3];

if (!contract || tokenId === undefined) {
  throw new Error('Usage: npm exec tsx examples/eth/erc721-owner-of.ts <ERC721_CONTRACT> <TOKEN_ID>');
}

const contractAddress = normalizeAddress(contract);
const result = await ethCall(contractAddress, `0x6352211e${padUint(tokenId)}`);

console.log(
  JSON.stringify(
    {
      contract: contractAddress,
      tokenId,
      owner: decodeAddress(result),
    },
    null,
    2,
  ),
);
