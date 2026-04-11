# 🟣 Inkflow

> AI-powered DeFi onboarding for the next billion users — built on [Inkonchain](https://inkonchain.com) (Kraken''s L2).

[![Built on Inkonchain](https://img.shields.io/badge/Built%20on-Inkonchain-7B5FFF?style=flat-square)](https://inkonchain.com)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20API-B46EFF?style=flat-square)](https://anthropic.com)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Agent%20Identity-7B5FFF?style=flat-square)](https://eips.ethereum.org/EIPS/eip-8004)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

## What is Inkflow?

Inkflow is a consumer-grade AI DeFi agent built natively on Inkonchain — Kraken''s own Layer 2. Users type what they want in plain English and Claude AI handles everything: protocol selection, transaction construction, and gas abstraction.

Built for the **Kraken x Surge AI Trading Agents Hackathon** — ERC-8004 track.

- 💬 **Natural language** — "swap $50 of ETH to USDC" just works
- 🔐 **Embedded wallets** — sign up with email or Google, no seed phrase
- ⚡ **Gasless transactions** — ERC-4337 paymasters handle gas silently
- 🤖 **ERC-8004 Agent Identity** — every AI action is signed with EIP-712 and posted as a trustless validation artifact on-chain
- 🔍 **Pre-flight explanations** — plain English before every transaction
- 🌍 **African payment support** — Paystack + Flutterwave (Nigerian virtual cards, bank transfer, mobile money)

---

## Hackathon Track — ERC-8004

Inkflow integrates the ERC-8004 Trustless Agent standard:

| Component | Details |
|-----------|---------|
| Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (Sepolia) |
| Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` (Sepolia) |
| Agent Wallet | `0x5B4C72e11E8af3b8242B08eaf3CFFfC2AC3BaD7E` |
| Registration TX | `0x4f8108f09061f360480671eef524dd83a31c9a5c7ec570146e1efb1330bc2cdd` |
| Chain | Ink Mainnet (Chain ID 57073) + Sepolia for registry |

Every DeFi action Claude executes is:
1. Signed as an EIP-712 `TradeIntent` before execution
2. Posted as a validation artifact to the Reputation Registry after execution
3. Fully verifiable on-chain

---

## Tech Stack

### Core
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Package Manager | pnpm |

### Blockchain
| Layer | Technology |
|-------|-----------|
| Chain | Inkonchain (OP Superchain L2, Chain ID 57073) |
| Account Abstraction | ZeroDev (ERC-4337) |
| Agent Identity | ERC-8004 + EIP-712 |
| Onchain clients | Viem + Wagmi |
| Protocols | SuperSwap v3, Velodrome, Aave/Tydro |

### AI
| Layer | Technology |
|-------|-----------|
| LLM | Claude API (claude-sonnet-4-20250514) |
| Intent parsing | Server-side API route |

### Payments
| Provider | Coverage |
|----------|----------|
| Paystack | Nigeria — cards, bank transfer, virtual cards |
| Flutterwave | Pan-Africa — mobile money, Mpesa, Airtel |

---

## Project Structure
inkflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # Claude AI intent parsing
│   │   │   ├── swap/          # Swap execution route
│   │   │   ├── deposit/       # Deposit execution route
│   │   │   ├── paystack/      # Paystack payment routes
│   │   │   └── flutterwave/   # Flutterwave payment routes
│   ├── lib/
│   │   ├── erc8004/           # ERC-8004 agent identity + EIP-712 signing
│   │   ├── execute/           # Gasless onchain execution (ZeroDev)
│   │   ├── claude/            # Claude AI intent parser
│   │   ├── zerodev/           # ZeroDev wallet setup
│   │   ├── paystack/          # Paystack SDK wrapper
│   │   └── flutterwave/       # Flutterwave SDK wrapper
│   ├── components/            # UI components
│   └── types/                 # TypeScript types
├── scripts/
│   └── register-agent.ts      # One-time ERC-8004 agent registration
└── public/

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Inkonchain RPC endpoint
- ZeroDev project ID
- Claude API key
- Paystack + Flutterwave keys

### Setup

```bash
git clone https://github.com/Isaaco3349/inkflow.git
cd inkflow
pnpm install
cp .env.example .env
# fill in your keys
pnpm dev
```

### Register ERC-8004 Agent (one-time)

```bash
npx tsx scripts/register-agent.ts
```

---

## Live Demo

[https://inkflow-rho.vercel.app](https://inkflow-rho.vercel.app)

---

## License

MIT © 2026 Inkflow
