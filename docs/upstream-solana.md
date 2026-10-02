# Upstream Solana Examples

This starter kit keeps the core integration small and points teams to upstream examples for program and token flows.

## MVP Examples

| Upstream example | How it maps into this starter |
| --- | --- |
| `basics/counter` | `examples/solana/counter-read-state.ts` reads counter account state through NOWNodes. |
| `basics/account-data` | `examples/solana/account-data-viewer.ts` reads and previews raw account data. |
| `basics/transfer-sol` | `examples/solana/transfer-sol.ts` submits a signed transaction and verifies it through transaction lookup. |
| `tokens/transfer-tokens` | `examples/solana/transfer-tokens.ts` reads token accounts and points to signed transfer verification. |
| Chainlink read-only client pattern | `examples/solana/chainlink-read-data.ts` demonstrates read-only account access through NOWNodes. |

## Advanced Recipes

Escrow, token creation, CPI, and oracle flows are documented in `docs/recipes`. They are intentionally kept outside the default app so the starter remains compact.
