# NOWNodes Hackathon Starter Kit Brief

This document is the English project brief for the starter kit.

## Goal

Build a reusable starter kit that helps hackathon teams integrate NOWNodes RPC quickly.

The project should let a participant:

1. Add `NOWNODES_API_KEY`.
2. Run the local app.
3. Use working Solana examples immediately.
4. Reuse CLI examples for Solana, Bitcoin, Cardano, Ethereum, and Coreum.
5. Prove that the project is actually using NOWNodes RPC.

## Scope

The starter kit includes:

- A local backend API.
- A browser UI for Solana RPC exploration.
- CLI examples for Solana.
- CLI examples for Bitcoin.
- CLI examples for Cardano.
- CLI examples for Ethereum.
- Coreum write-flow examples with safety guards.
- Documentation and recipes.

## Local Backend API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Checks that the backend is running and whether `NOWNODES_API_KEY` is configured. |
| `GET /api/chains` | Returns supported chain metadata. |
| `GET /api/solana/latest` | Returns Solana slot, block height, and latency through NOWNodes. |
| `GET /api/solana/address/:address` | Returns SOL balance for an address. |
| `GET /api/solana/tx/:signature` | Returns Solana transaction data. |
| `POST /api/rpc/solana` | Proxies arbitrary Solana JSON-RPC calls to NOWNodes. |

The Solana RPC proxy is intentionally open for a hackathon playground. Production deployments should add authentication, rate limiting, and method allowlists.

## Browser UI

| Screen | Purpose |
| --- | --- |
| Dashboard | Shows Solana slot, block height, latency, and NOWNodes status. |
| Address Lookup | Looks up SOL balance for a public key. |
| Transaction Lookup | Looks up raw transaction data by signature. |
| RPC Playground | Lets users run arbitrary Solana JSON-RPC methods and params. |

## CLI Verifier

The project includes:

```bash
npm run verify:nownodes
```

It checks:

- `NOWNODES_API_KEY` is configured.
- Solana RPC responds through NOWNodes.
- Solana `getSlot` succeeds.
- Bitcoin `getbestblockhash` succeeds.
- Cardano Blockfrost latest-block lookup succeeds.

Expected success:

```text
NOWNodes API key: OK
Solana getSlot: OK
Bitcoin getbestblockhash: OK
Cardano Blockfrost latest block: OK
Result: PASS
```

## Configuration

The starter kit uses `.env` locally and `.env.example` as the shareable template.

Secrets must never be committed or shared.

## Example Categories

### Solana

The Solana examples cover:

- wallet balance checks;
- transaction lookup and parsing;
- token balances;
- block and slot exploration;
- signature status checks;
- account data inspection;
- NFT-like account discovery;
- signed transaction broadcast patterns;
- Chainlink-style read-only account access.

### Ethereum

The Ethereum examples cover:

- ETH balance checks;
- block and transaction lookup;
- transaction receipts;
- ERC-20 balances, metadata, allowances, and transfer events;
- ERC-721 owner and metadata lookup;
- gas price and nonce lookup;
- contract code checks;
- storage slot reading.

### Bitcoin

The Bitcoin examples cover:

- latest block and block lookup;
- decoded transaction lookup;
- address balances, UTXOs, and transaction history;
- mempool information;
- fee estimates;
- raw transaction decode and guarded broadcast;
- OP_RETURN reading.

### Cardano

The Cardano examples use NOWNodes' Blockfrost-compatible REST endpoint and cover:

- network information;
- latest block and block lookup;
- latest epoch and epoch protocol parameters;
- address balances, UTXOs, and transaction history;
- transaction summaries, UTXO breakdowns, and metadata;
- native asset details and holder addresses;
- stake pool list and pool details.

### Coreum

The Coreum examples focus on reusable write-flow patterns:

- simulate transaction;
- send token;
- issue Smart Token;
- mint Smart Token;
- create NFT class.

Coreum examples default to testnet and require explicit flags for signing and broadcasting.

## Definition of Done

The starter kit is ready when:

- `npm install` works.
- `npm run dev` starts the backend and UI.
- `.env.example` contains no real secrets.
- `npm run verify:nownodes` checks Solana, Bitcoin, and Cardano through NOWNodes.
- The Solana dashboard shows live data with a valid API key.
- CLI examples are documented in README.
- Private keys, mnemonics, and API keys are not stored in backend code.
- Security and production-hardening notes are documented.

## References

- NOWNodes Docs: <https://docs.nownodes.io/>
- Solana Docs: <https://solana.com/docs>
- Ethereum JSON-RPC Docs: <https://ethereum.org/developers/docs/apis/json-rpc/>
- Ethereum Execution APIs: <https://ethereum.github.io/execution-apis/>
- NOWNodes Bitcoin Docs: <https://docs.nownodes.io/btc/>
- NOWNodes Cardano Docs: <https://docs.nownodes.io/ada/>
- Cardano Developer Portal NOWNodes entry: <https://developers.cardano.org/tools/nownodes/>
- Coreum Foundation: <https://github.com/CoreumFoundation>
- coreum-js: <https://www.npmjs.com/package/coreum-js>
