# Project Review and Hardening Notes

This review highlights areas that may confuse users or require hardening before production use.

## High-Priority Issues

| Area | Risk | Recommendation |
| --- | --- | --- |
| Local `.env` files | `.env` can contain `NOWNODES_API_KEY` or `COREUM_MNEMONIC`. If the full folder is zipped manually, secrets can be shared even though `.env` is gitignored. | Share source without `.env`. Use `.env.example` only. Rotate any key that was accidentally shared. |
| Solana and Bitcoin RPC proxies | `POST /api/rpc/solana` and `POST /api/rpc/btc` accept arbitrary methods and params. This is useful for a playground but risky in public deployments. | Add authentication, rate limiting, request size limits, and method allowlists for production. |
| Coreum mnemonic signing | Coreum examples support mnemonic signing for reusable write flows. Mishandling mnemonic values can expose funds. | Use testnet mnemonics for development. Never put production mnemonics in frontend code. Prefer wallet signing or a secure server-side signer. |
| Coreum dependencies | `coreum-js` currently installs dependencies with npm audit findings through WalletConnect/CosmJS/protobufjs, including critical advisories with no direct fix available from this project. | Keep Coreum examples clearly marked as starter/reference code, avoid processing untrusted protobuf schemas, run `npm audit` before release, and upgrade when the upstream SDK supports newer dependencies. |
| Manual folder sharing | `node_modules`, `.DS_Store`, local `.env`, and generated files can be included if the folder is zipped directly. | Create a clean archive from git-tracked source or remove local-only files before sharing. |

## User-Confusion Points

| Area | What may be confusing | Documentation action |
| --- | --- | --- |
| Solana Program Accounts Viewer | Some endpoints reject `getProgramAccounts` or return limits/errors. | README now states that endpoint plan or node policy can block this method. |
| Solana Counter Reader | Output is meaningful only for a real counter account; arbitrary accounts decode to meaningless bytes. | README now calls this out. |
| NFT examples | Raw RPC NFT detection uses heuristics and is not equivalent to full metadata verification. | Keep wording as "NFT-like" and explain that metadata verification is out of scope. |
| Coreum simulation | Simulation can fail if the fee payer address does not exist on-chain. | README now explains expected placeholder-address simulation errors. |
| Ethereum code checker | Some addresses that look like EOAs can have delegated code under newer account-abstraction patterns. | Treat `eth_getCode` as "has code / no code", not as a perfect account classification model. |
| Bitcoin transaction lookup | `getrawtransaction` without a block hash can fail on nodes that do not expose unrestricted transaction indexing. | README recommends passing `--block=<BLOCK_HASH>` when looking up known historical transactions. |
| `npm exec -- tsx` syntax | `--` is required before scripts that take `--flag=value` args so npm does not consume the flags. | README uses `npm exec -- tsx` where script flags are expected. |

## Recommended Production Hardening

1. Add API authentication for any hosted backend.
2. Add RPC method allowlists per chain.
3. Add request body size limits.
4. Add per-IP or per-user rate limits.
5. Do not expose NOWNodes API keys to the browser.
6. Move write signing to wallet flows or a hardened backend signer.
7. Add integration tests using mock RPC responses.
8. Add CI checks for formatting, linting, and `npm audit`.
9. Add a release script that excludes `.env`, `node_modules`, `.DS_Store`, and generated artifacts.
10. Document which examples are safe on mainnet and which are testnet-only by default.

## Current Verification Status

- Solana verifier and read examples were tested against NOWNodes with a local API key.
- Ethereum read examples were tested against NOWNodes Ethereum mainnet.
- Coreum write-flow examples were tested in dry-run mode and simulation mode against Coreum testnet.
- Coreum simulation with placeholder addresses correctly returns an on-chain "address does not exist" error instead of broadcasting anything.
- `npm audit --omit=dev` currently reports 20 transitive vulnerabilities from the Coreum dependency tree, including 1 critical advisory in `protobufjs`.
