import { decodeAbiString, ethCall, normalizeAddress, padUint } from './_rpc';

const contract = process.argv[2];
const tokenId = process.argv[3];

if (!contract || tokenId === undefined) {
  throw new Error('Usage: npm exec tsx examples/eth/erc721-token-uri.ts <ERC721_CONTRACT> <TOKEN_ID>');
}

const contractAddress = normalizeAddress(contract);
const result = await ethCall(contractAddress, `0xc87b56dd${padUint(tokenId)}`);
const tokenUri = decodeAbiString(result);

console.log(
  JSON.stringify(
    {
      contract: contractAddress,
      tokenId,
      tokenUri,
    },
    null,
    2,
  ),
);
