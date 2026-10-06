# NOWNodes Multi-Chain Starter Kit

This repository is a hackathon-oriented starter kit for integrating NOWNodes RPC into Solana, Bitcoin, Cardano, Ethereum, and Coreum projects.

It includes:

- A small local Solana API and browser UI.
- CLI examples for Solana read flows and signed-transaction workflows.
- CLI examples for Bitcoin chain, block, transaction, mempool, and fee-estimation flows.
- CLI examples for Cardano Blockfrost-compatible REST flows.
- CLI examples for Ethereum wallet, token, NFT, explorer, and debugging flows.
- Coreum write-flow examples with dry-run, simulation, signing, and guarded broadcast modes.
- Documentation and recipes that explain how to reuse each example safely.

The project is intentionally lightweight: most examples call JSON-RPC directly so teams can see exactly what is sent to NOWNodes.

## Safety First

- Never commit or share `.env`.
- `.env.example` is safe to share; `.env` is not.
- Private keys and mnemonics must stay in local tooling, a wallet, or a secure server-side environment.
- Backend code must not store user signing material.
- Write-flow examples use dry-run by default where practical.
- Coreum broadcast requires explicit `--broadcast --yes`.
- Coreum mainnet signing or broadcast additionally requires `--network=mainnet --mainnet --yes`.
- Solana and Ethereum send/broadcast examples expect already signed payloads.

## Requirements

- Node.js 18 or newer.
- A NOWNodes API key.
- Optional: a Coreum testnet wallet if you want to test Coreum signing or broadcast flows.

## Quickstart

```bash
cp .env.example .env
# Add your NOWNODES_API_KEY to .env
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Run the NOWNodes verifier:

```bash
npm run verify:nownodes
```

Expected successful output:

```text
NOWNodes API key: OK
Solana getSlot: OK
Bitcoin getbestblockhash: OK
Cardano Blockfrost latest block: OK
Result: PASS
```

## Configuration

`.env.example` contains all supported settings:

```bash
NOWNODES_API_KEY=
SOL_NETWORK=mainnet
SOLANA_RPC_URL=https://sol.nownodes.io/${NOWNODES_API_KEY}
BTC_NETWORK=mainnet
BTC_RPC_URL=https://btc.nownodes.io/
BTC_BLOCKBOOK_URL=https://btcbook.nownodes.io
ADA_NETWORK=mainnet
ADA_BLOCKFROST_URL=https://ada-blockfrost.nownodes.io
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

Notes:

- `NOWNODES_API_KEY` is required for Solana, Bitcoin, Cardano, and Ethereum examples.
- Bitcoin examples use `BTC_RPC_URL`, `BTC_BLOCKBOOK_URL`, and the same `NOWNODES_API_KEY`.
- Cardano examples use `ADA_BLOCKFROST_URL` and the same `NOWNODES_API_KEY`.
- `COREUM_MNEMONIC` is required only for Coreum `--sign` or `--broadcast` flows.
- `COREUM_MNEMONIC` should be a testnet mnemonic unless you fully understand the mainnet guard flags.
- `SOLANA_RPC_URL` supports `${NOWNODES_API_KEY}` interpolation.

## Local API

The local API powers the included Solana browser UI and also exposes Bitcoin utility endpoints for backend/API examples.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Checks whether the backend is running and whether the API key is configured. |
| `GET /api/chains` | Returns supported chain metadata. |
| `GET /api/solana/latest` | Returns Solana slot, block height, and latency. |
| `GET /api/solana/address/:address` | Returns SOL balance in lamports and SOL. |
| `GET /api/solana/tx/:signature` | Returns raw Solana transaction data. |
| `POST /api/rpc/solana` | Proxies any Solana JSON-RPC method supported by the endpoint and plan. |
| `GET /api/btc/latest` | Returns Bitcoin chain height, best block hash, and block header details. |
| `GET /api/btc/block/:hashOrHeight` | Returns Bitcoin block data by block hash or height. |
| `GET /api/btc/tx/:txid?blockHash=<hash>` | Returns a decoded Bitcoin transaction. |
| `POST /api/rpc/btc` | Proxies Bitcoin JSON-RPC methods supported by the endpoint and plan. |

The RPC proxy intentionally does not keep a method allowlist. This is useful for a hackathon playground, but production apps should add authentication, rate limiting, and an allowlist.

## Browser UI

Run:

```bash
npm run dev
```

The UI includes:

- Dashboard: live Solana slot, block height, latency, and API status.
- Address Lookup: SOL balance lookup by public key.
- Transaction Lookup: raw Solana transaction lookup by signature.
- RPC Playground: arbitrary Solana JSON-RPC method and params.

## Solana Examples

Examples live in `examples/solana`.

| Example | Command | Why it is useful |
| --- | --- | --- |
| Balance Checker | `npm exec tsx examples/solana/balance-checker.ts <SOLANA_PUBLIC_KEY>` | Shows the simplest wallet dashboard building block: `getBalance` plus lamports-to-SOL conversion. |
| Transaction Lookup | `npm exec tsx examples/solana/transaction-lookup.ts <SIGNATURE>` | Builds explorer and support tooling by fetching raw transaction data. |
| Token Balances | `npm exec -- tsx examples/solana/token-balances.ts <OWNER_PUBLIC_KEY> [--program=token\|token-2022\|both]` | Lists SPL Token and Token-2022 accounts for portfolio dashboards. |
| Recent Transactions | `npm exec tsx examples/solana/recent-transactions.ts <ADDRESS> [LIMIT_1_TO_1000]` | Shows recent activity for an account using `getSignaturesForAddress`. |
| Signature Status | `npm exec tsx examples/solana/signature-status.ts <SIGNATURE> [MORE_SIGNATURES...]` | Checks confirmation and failure state for one or more transactions. |
| Block / Slot Explorer | `npm exec tsx examples/solana/block-slot-explorer.ts [SLOT]` | Retrieves slot, block height, block hashes, and sample signatures. |
| Token Mint Inspector | `npm exec tsx examples/solana/token-mint-inspector.ts <TOKEN_MINT>` | Inspects mint metadata, supply, decimals, authorities, and Token-2022 extensions. |
| Program Accounts Viewer | `npm exec -- tsx examples/solana/program-accounts-viewer.ts <PROGRAM_ID> [--data-size=N] [--memcmp=OFFSET:BYTES] [--limit=1..100]` | Demonstrates `getProgramAccounts` with safeguards. Some endpoints or plans may reject this method. |
| Transaction Parser | `npm exec tsx examples/solana/transaction-parser.ts <SIGNATURE>` | Converts raw transaction data into a readable fee/status/program/balance summary. |
| NFT Owner / Mint Viewer | `npm exec tsx examples/solana/nft-owner-mint-viewer.ts owner <OWNER_PUBLIC_KEY> [LIMIT_1_TO_100]` | Finds NFT-like token accounts by owner using raw RPC heuristics. |
| NFT Mint Owner Lookup | `npm exec tsx examples/solana/nft-owner-mint-viewer.ts mint <NFT_MINT>` | Finds the largest token account for a mint and reads its owner. |
| Counter State Reader | `npm exec tsx examples/solana/counter-read-state.ts <COUNTER_ACCOUNT>` | Reads account bytes for a Solana counter-style program state. Use a real counter account for meaningful output. |
| Account Data Viewer | `npm exec tsx examples/solana/account-data-viewer.ts <ACCOUNT_PUBLIC_KEY>` | Displays raw account data, owner, executable flag, byte length, base64, and hex preview. |
| Transfer SOL | `npm exec tsx examples/solana/transfer-sol.ts <SIGNED_TRANSACTION_BASE64>` | Broadcasts an already signed SOL transfer transaction. It never handles private keys. |
| Transfer Tokens | `npm exec tsx examples/solana/transfer-tokens.ts <OWNER_PUBLIC_KEY> <TOKEN_MINT>` | Reads token accounts and explains the signed token transfer verification flow. |
| Chainlink Read Data | `npm exec tsx examples/solana/chainlink-read-data.ts <CHAINLINK_FEED_ACCOUNT>` | Demonstrates a read-only account client pattern for feed-style integrations. |

## Bitcoin Examples

Examples live in `examples/btc`.

| Example | Command | Why it is useful |
| --- | --- | --- |
| Latest Block | `npm exec tsx examples/btc/latest-block.ts` | Reads chain height, best block hash, header timing, and sync metadata. |
| Block Lookup | `npm exec -- tsx examples/btc/block-lookup.ts <BLOCK_HEIGHT_OR_HASH> [--full]` | Fetches block details by height or hash and prints a small transaction sample. Default mode returns txids only; `--full` requests decoded transactions. |
| Transaction Lookup | `npm exec -- tsx examples/btc/transaction-lookup.ts <TXID> [--block=<BLOCK_HASH>]` | Decodes a raw transaction. Passing `--block` makes historical lookup reliable without relying on an unrestricted tx index. |
| Mempool Info | `npm exec tsx examples/btc/mempool-info.ts` | Reads mempool size, memory usage, and minimum relay fee data. |
| Fee Estimate | `npm exec tsx examples/btc/fee-estimate.ts [CONFIRMATION_TARGET_1_TO_1008]` | Calls `estimatesmartfee` for wallet/payment fee UX. |
| Address UTXOs | `npm exec -- tsx examples/btc/address-utxos.ts <BTC_ADDRESS> [--confirmed=true\|false] [--limit=1..100]` | Lists spendable outputs for a wallet or payment address via Blockbook. |
| Address Balance | `npm exec -- tsx examples/btc/address-balance.ts <BTC_ADDRESS>` | Reads confirmed/unconfirmed balance, total received/sent, and transaction count. |
| Address Transactions | `npm exec -- tsx examples/btc/address-transactions.ts <BTC_ADDRESS> [--page=1] [--limit=1..50] [--full]` | Paginates address transaction history as txids or compact decoded summaries. |
| Raw Transaction Broadcast | `npm exec -- tsx examples/btc/raw-transaction-broadcast.ts <SIGNED_RAW_TX_HEX> [--broadcast --yes]` | Safely prepares a signed raw transaction broadcast. Dry-run by default; no private keys. |
| Decode Raw Transaction | `npm exec -- tsx examples/btc/decode-raw-transaction.ts <RAW_TX_HEX> [--iswitness=true\|false]` | Decodes raw transaction hex through Bitcoin JSON-RPC. |
| Validate Address | `npm exec -- tsx examples/btc/validate-address.ts <BTC_ADDRESS>` | Validates address format and shows script/witness details. |
| Block Fee Summary | `npm exec -- tsx examples/btc/block-fee-summary.ts <BLOCK_HEIGHT_OR_HASH>` | Combines Blockbook fee stats with decoded block fee totals. |
| Mempool Transaction | `npm exec -- tsx examples/btc/mempool-transaction.ts [TXID]` | Reads mempool metadata for a txid, or samples one current mempool tx. |
| Payment Monitor | `npm exec -- tsx examples/btc/payment-monitor.ts <TXID> [--confirmations=1] [--interval-ms=5000] [--max-attempts=1]` | Polls a transaction until it reaches the required confirmation count. |
| OP_RETURN Reader | `npm exec -- tsx examples/btc/op-return-reader.ts <BLOCK_HEIGHT_OR_HASH> [--limit=1..100]` | Extracts OP_RETURN outputs from a block for inscription/message/debugging flows. |

## Cardano Examples

Examples live in `examples/cardano`.

These examples use NOWNodes' Blockfrost-compatible Cardano REST endpoint. Most examples are read-only and can derive a recent block, transaction, address, asset, or pool automatically when an argument is omitted.

| Example | Command | Why it is useful |
| --- | --- | --- |
| Network Info | `npm exec -- tsx examples/cardano/network-info.ts` | Reads supply and stake network totals for dashboards and health checks. |
| Latest Block | `npm exec -- tsx examples/cardano/latest-block.ts` | Gets current block hash, height, slot, and transaction count. |
| Block Lookup | `npm exec -- tsx examples/cardano/block-lookup.ts <BLOCK_HASH_OR_HEIGHT>` | Fetches a specific Cardano block by hash or height. |
| Latest Epoch | `npm exec -- tsx examples/cardano/latest-epoch.ts` | Reads current epoch timing, block count, and transaction count. |
| Epoch Parameters | `npm exec -- tsx examples/cardano/epoch-parameters.ts [EPOCH_NUMBER_OR_latest]` | Shows protocol parameters for fee and transaction-building tools. |
| Address Info | `npm exec -- tsx examples/cardano/address-info.ts [ADDRESS]` | Reads ADA/native-asset balance, address type, stake address, and script flag. |
| Address UTXOs | `npm exec -- tsx examples/cardano/address-utxos.ts [ADDRESS] [--count=10] [--page=1]` | Lists spendable UTXOs for wallet and payment flows. |
| Address Transactions | `npm exec -- tsx examples/cardano/address-transactions.ts [ADDRESS] [--count=10] [--page=1]` | Paginates address transaction history. |
| Transaction Summary | `npm exec -- tsx examples/cardano/transaction-summary.ts [TX_HASH]` | Summarizes block placement, fees, deposits, size, validity interval, and output amounts. |
| Transaction UTXOs | `npm exec -- tsx examples/cardano/transaction-utxos.ts [TX_HASH]` | Shows full input/output UTXO breakdown for a transaction. |
| Transaction Metadata | `npm exec -- tsx examples/cardano/transaction-metadata.ts [TX_HASH]` | Reads JSON metadata labels attached to a transaction. |
| Asset Info | `npm exec -- tsx examples/cardano/asset-info.ts [ASSET_UNIT]` | Inspects a native asset or NFT policy/name unit. |
| Asset Addresses | `npm exec -- tsx examples/cardano/asset-addresses.ts [ASSET_UNIT] [--count=10] [--page=1]` | Finds addresses holding a specific native asset. |
| Pool List | `npm exec -- tsx examples/cardano/pool-list.ts [--count=10] [--page=1]` | Lists registered stake pools for staking explorers. |
| Pool Info | `npm exec -- tsx examples/cardano/pool-info.ts [POOL_ID]` | Reads pool pledge, margin, fixed cost, owners, relays, metadata, and activity state. |

## Ethereum Examples

Examples live in `examples/eth`.

| Example | Command | Why it is useful |
| --- | --- | --- |
| Balance Checker | `npm exec tsx examples/eth/balance-checker.ts <ETH_ADDRESS> [BLOCK_TAG]` | Reads ETH balance via `eth_getBalance` and formats wei to ETH. |
| Latest Block | `npm exec tsx examples/eth/latest-block.ts [--full]` | Shows latest block metadata and transaction count. |
| Transaction Lookup | `npm exec tsx examples/eth/transaction-lookup.ts <TX_HASH>` | Fetches transaction details for explorer or support tooling. |
| Transaction Receipt | `npm exec tsx examples/eth/transaction-receipt.ts <TX_HASH>` | Reads mined status, gas used, contract address, and event logs. |
| ERC-20 Balance | `npm exec tsx examples/eth/erc20-balance.ts <TOKEN_ADDRESS> <OWNER_ADDRESS>` | Calls `balanceOf`, `symbol`, and `decimals` without a full ABI dependency. |
| ERC-20 Token Info | `npm exec tsx examples/eth/erc20-token-info.ts <TOKEN_ADDRESS>` | Reads `name`, `symbol`, `decimals`, and `totalSupply`. |
| Event Logs | `npm exec tsx examples/eth/event-logs.ts <CONTRACT_ADDRESS> <TOPIC0> [FROM_BLOCK] [TO_BLOCK]` | Demonstrates `eth_getLogs` for contract event indexing. |
| Address Nonce | `npm exec tsx examples/eth/address-nonce.ts <ETH_ADDRESS> [BLOCK_TAG]` | Reads transaction count for wallet and transaction-building flows. |
| Gas Price | `npm exec tsx examples/eth/gas-price.ts` | Reads gas price and priority fee for fee estimation UI. |
| Contract Code Checker | `npm exec tsx examples/eth/contract-code-checker.ts <ETH_ADDRESS> [BLOCK_TAG]` | Distinguishes contracts from no-code addresses using `eth_getCode`. |
| Transaction Summary | `npm exec tsx examples/eth/transaction-summary.ts <TX_HASH>` | Combines transaction and receipt into a readable fee/status/value summary. |
| Decode ERC-20 Transfer | `npm exec tsx examples/eth/decode-erc20-transfer.ts <TX_HASH>` | Extracts ERC-20 `Transfer` logs from a receipt. |
| ERC-721 Owner Of | `npm exec tsx examples/eth/erc721-owner-of.ts <ERC721_CONTRACT> <TOKEN_ID>` | Reads NFT ownership through `ownerOf(tokenId)`. |
| ERC-721 Token URI | `npm exec tsx examples/eth/erc721-token-uri.ts <ERC721_CONTRACT> <TOKEN_ID>` | Reads NFT metadata URI through `tokenURI(tokenId)`. |
| Allowance Checker | `npm exec tsx examples/eth/allowance-checker.ts <TOKEN_ADDRESS> <OWNER_ADDRESS> <SPENDER_ADDRESS>` | Reads ERC-20 approval state through `allowance(owner, spender)`. |
| ERC-20 Transfer Events | `npm exec -- tsx examples/eth/erc20-transfer-events.ts <TOKEN_ADDRESS> [--from-block=HEX_OR_TAG] [--to-block=HEX_OR_TAG] [--from=ADDRESS] [--to=ADDRESS] [--limit=N]` | Searches token transfers with indexed `from` and `to` filters. |
| ERC-721 Contract Info | `npm exec tsx examples/eth/erc721-contract-info.ts <ERC721_CONTRACT>` | Reads collection `name`, `symbol`, and ERC-721 interface support. |
| Storage Slot Reader | `npm exec tsx examples/eth/storage-slot-reader.ts <CONTRACT_ADDRESS> <SLOT_INDEX_OR_HEX> [BLOCK_TAG]` | Reads raw contract storage through `eth_getStorageAt`. Useful for debugging. |
| Block Transactions | `npm exec tsx examples/eth/block-transactions.ts [BLOCK_NUMBER_HEX_OR_TAG] [LIMIT_1_TO_100]` | Summarizes transactions in a block for block explorer prototypes. |

## Coreum Write-Flow Examples

Examples live in `examples/coreum`.

These examples build real Coreum transaction messages. They are designed to be reusable while still avoiding accidental mainnet side effects.

| Example | Command | Why it is useful |
| --- | --- | --- |
| Simulate Tx | `npm exec -- tsx examples/coreum/simulate-tx.ts --from=<COREUM_ADDRESS> --to=<COREUM_ADDRESS> --amount=1 --denom=utestcore` | Simulates a `MsgSend` without signing or broadcasting. Useful for gas and fee checks. |
| Send Token | `npm exec -- tsx examples/coreum/send-token.ts <TO_ADDRESS> --from=<COREUM_ADDRESS> --amount=1 --denom=utestcore --simulate` | Builds a reusable Coreum `MsgSend` flow for payments. |
| Issue Smart Token | `npm exec -- tsx examples/coreum/issue-smart-token.ts --from=<COREUM_ADDRESS> --symbol=HACK --subunit=uhack --precision=6 --initial-amount=1000000 --minting --simulate` | Shows how to create a Coreum Smart Token with optional features. |
| Mint Smart Token | `npm exec -- tsx examples/coreum/mint-smart-token.ts --from=<COREUM_ADDRESS> --denom=uhack-<issuer> --amount=1000 --simulate` | Mints additional supply for an issued Smart Token when the feature allows it. |
| Create NFT Class | `npm exec -- tsx examples/coreum/create-nft-class.ts --from=<COREUM_ADDRESS> --symbol=HNFT --name="Hackathon NFT" --simulate` | Creates an NFT class as the first step of an NFT minting flow. |

Coreum modes:

| Mode | Behavior |
| --- | --- |
| no flag | Builds and prints the message only. |
| `--simulate` | Simulates against the selected Coreum RPC endpoint. |
| `--sign` | Signs locally using `COREUM_MNEMONIC` and prints a base64 `TxRaw`. |
| `--broadcast --yes` | Signs and broadcasts to the selected network. |
| `--network=mainnet --mainnet --yes` | Required for mainnet signing or broadcast. |

## Known Limitations

- Solana `getProgramAccounts` may be blocked by endpoint plan or node policy.
- Coreum simulation requires a valid funded or known on-chain fee payer. Placeholder addresses can return an expected "address does not exist" simulation error.
- `coreum-js` currently pulls older WalletConnect, CosmJS, and protobufjs transitive dependencies. `npm audit --omit=dev` currently reports vulnerabilities in that dependency tree; review before production use.
- The local Solana and Bitcoin RPC proxies are intentionally open for hackathon development. Production apps should add auth, rate limits, request validation, and method allowlists.
- The browser UI covers Solana only. Bitcoin, Cardano, Ethereum, and Coreum are currently CLI/API examples.
- Bitcoin examples are read-only and do not manage wallet keys.
- Cardano examples are read-only and use NOWNodes' Blockfrost-compatible REST interface. Rosetta and Ogmios/WebSocket flows are not included yet.

## Project Review Notes

See [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) for risks, user-confusion points, and recommended hardening work before production use.

## References

- NOWNodes Docs: <https://docs.nownodes.io/>
- NOWNodes Bitcoin Docs: <https://docs.nownodes.io/btc/>
- NOWNodes Cardano Docs: <https://docs.nownodes.io/ada/>
- NOWNodes Cardano Blockfrost Docs: <https://nownodes.gitbook.io/ada-cardano-1/cardano-ada/blockfrost/addresses>
- Cardano Developer Portal NOWNodes entry: <https://developers.cardano.org/tools/nownodes/>
- Solana RPC Docs: <https://solana.com/docs/rpc>
- Ethereum JSON-RPC: <https://ethereum.org/developers/docs/apis/json-rpc/>
- Ethereum Execution APIs: <https://ethereum.github.io/execution-apis/>
- Coreum JS: <https://www.npmjs.com/package/coreum-js>
- Coreum Foundation: <https://github.com/CoreumFoundation>
