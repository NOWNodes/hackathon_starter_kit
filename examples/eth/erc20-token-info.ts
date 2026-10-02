import { decodeAbiString, decodeUint, ethCall, formatUnits, normalizeAddress } from './_rpc';

const token = process.argv[2];

if (!token) {
  throw new Error('Usage: npm exec tsx examples/eth/erc20-token-info.ts <TOKEN_ADDRESS>');
}

const tokenAddress = normalizeAddress(token);
const [nameRaw, symbolRaw, decimalsRaw, totalSupplyRaw] = await Promise.all([
  ethCall(tokenAddress, '0x06fdde03'),
  ethCall(tokenAddress, '0x95d89b41'),
  ethCall(tokenAddress, '0x313ce567'),
  ethCall(tokenAddress, '0x18160ddd'),
]);

const name = decodeAbiString(nameRaw);
const symbol = decodeAbiString(symbolRaw);
const decimals = Number(decodeUint(decimalsRaw));
const totalSupply = decodeUint(totalSupplyRaw);

console.log(
  JSON.stringify(
    {
      token: tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      formattedTotalSupply: formatUnits(totalSupply, decimals),
    },
    null,
    2,
  ),
);
