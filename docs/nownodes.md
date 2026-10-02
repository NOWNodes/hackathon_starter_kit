# NOWNodes Configuration

The starter kit reads local configuration from `.env`. Use `.env.example` as the shareable template and keep real secrets in `.env` only.

```bash
NOWNODES_API_KEY=
SOL_NETWORK=mainnet
SOLANA_RPC_URL=https://sol.nownodes.io/${NOWNODES_API_KEY}
BTC_NETWORK=mainnet
BTC_RPC_URL=https://btc.nownodes.io/
BTC_BLOCKBOOK_URL=https://btcbook.nownodes.io
ETH_NETWORK=mainnet
ETH_RPC_URL=https://eth.nownodes.io/
COREUM_NETWORK=testnet
COREUM_RPC_URL=https://full-node.testnet-1.coreum.dev:26657
COREUM_WS_URL=wss://full-node.testnet-1.coreum.dev:26657
COREUM_DENOM=utestcore
COREUM_FROM_ADDRESS=
COREUM_TO_ADDRESS=
COREUM_MNEMONIC=
PORT=3000
```

## Solana

`SOLANA_RPC_URL` supports `${NOWNODES_API_KEY}` interpolation. Requests also send the key in the `api-key` header for compatibility with NOWNodes-style endpoints.

The local RPC playground intentionally does not maintain a method allowlist. Availability depends on the NOWNodes endpoint and plan. Production deployments should add authentication, rate limiting, request size limits, and method allowlists.

## Ethereum

Ethereum examples use `ETH_RPC_URL` and send `NOWNODES_API_KEY` in the request headers. The default endpoint is Ethereum mainnet.

All Ethereum examples are read-only. They do not hold private keys and do not broadcast signed transactions.

## Bitcoin

Bitcoin examples use `BTC_RPC_URL` and `BTC_BLOCKBOOK_URL`, and send `NOWNODES_API_KEY` in the request headers. The defaults are Bitcoin mainnet JSON-RPC and Bitcoin Blockbook.

Most included BTC examples are read-only: latest block state, block lookup, transaction lookup, address balance/UTXO/history, mempool info, fee estimates, fee summaries, payment monitoring, and OP_RETURN reading. Transaction lookup supports `--block=<BLOCK_HASH>` so it can query transactions from a known block even when a node does not expose an unrestricted transaction index.

`raw-transaction-broadcast.ts` is guarded. It only validates and prints a dry-run summary unless `--broadcast --yes` is passed with an already signed raw transaction.

## Coreum

Coreum examples use Coreum RPC endpoints directly and default to testnet. `COREUM_MNEMONIC` is required only for `--sign` or `--broadcast`.

Broadcasting is intentionally guarded:

- `--broadcast --yes` is required for any broadcast.
- Mainnet signing or broadcast additionally requires `--network=mainnet --mainnet --yes`.

Use a testnet mnemonic for development and never expose mnemonics in browser code.
