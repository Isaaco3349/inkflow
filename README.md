# 🟣 Inkflow

> AI-powered DeFi onboarding for the next billion users — built on [Inkonchain](https://inkonchain.com).

[![Built on Inkonchain](https://img.shields.io/badge/Built%20on-Inkonchain-7B5FFF?style=flat-square)](https://inkonchain.com)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20API-B46EFF?style=flat-square)](https://anthropic.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

## 📱 Mobile Apps — Coming Soon

> Native iOS and Android apps are on the roadmap. The web app ships first.

[![App Store](https://img.shields.io/badge/App%20Store-Coming%20Soon-7B5FFF?style=flat-square&logo=apple)](./mobile/COMING_SOON.md)
[![Google Play](https://img.shields.io/badge/Google%20Play-Coming%20Soon-B46EFF?style=flat-square&logo=google-play)](./mobile/COMING_SOON.md)

---

## What is Inkflow?

Inkflow is a consumer-grade onboarding layer that sits on top of Ink's DeFi protocols. It lets anyone — including total crypto beginners — interact with DeFi through:

- 💬 **Natural language** — "swap $50 of ETH to USDC" just works
- 🔐 **Embedded wallets** — sign up with email or Google, no seed phrase
- ⚡ **Gasless transactions** — ERC-4337 paymasters handle gas silently
- 🔍 **Pre-flight explanations** — plain English before every transaction
- 📊 **Risk dashboard** — live liquidation risk, yield comparisons, portfolio exposure
- 🌍 **African payment support** — Paystack + Flutterwave (Nigerian virtual cards, bank transfer, mobile money)

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
| Chain | Inkonchain (OP Superchain L2) |
| Account Abstraction | ZeroDev (ERC-4337) |
| Alt AA providers | Alchemy Account Kit, Safe |
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
| Paystack | Nigeria — cards, bank transfer, virtual cards, BVN verify |
| Flutterwave | Pan-Africa — mobile money, Mpesa, Airtel, broader card support |

---

## Project Structure

```
inkflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # Claude AI intent parsing
│   │   │   ├── paystack/      # Paystack payment routes
│   │   │   └── flutterwave/   # Flutterwave payment routes
│   │   ├── dashboard/         # Main user dashboard
│   │   └── onboard/           # Onboarding flow
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── wallet/            # Wallet + balance components
│   │   ├── chat/              # AI chat interface
│   │   └── layout/            # Nav, footer, shell
│   ├── lib/
│   │   ├── paystack/          # Paystack SDK wrapper
│   │   ├── flutterwave/       # Flutterwave SDK wrapper
│   │   ├── zerodev/           # ZeroDev wallet setup
│   │   └── claude/            # Claude API client
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
├── mobile/
│   └── COMING_SOON.md         # Mobile app roadmap
├── docs/
│   └── ARCHITECTURE.md        # System architecture
└── public/                    # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A [Inkonchain](https://docs.inkonchain.com) RPC endpoint
- [ZeroDev](https://zerodev.app) project ID
- [Claude API](https://anthropic.com) key
- [Paystack](https://paystack.com) secret key
- [Flutterwave](https://flutterwave.com) secret key

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/inkflow.git
cd inkflow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local` (see `.env.example` for all required variables).

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Never commit your `.env.local`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Ink Builder Program

Inkflow is being built as part of the [Ink Builder Program](https://docs.inkonchain.com/ink-builder-program/overview). If you're building on Ink too, check out:

- [Spark Program](https://docs.inkonchain.com/ink-builder-program/spark-program) — early-stage grants
- [Forge Program](https://docs.inkonchain.com/ink-builder-program/forge-program) — growth grants
- [Office Hours](https://docs.inkonchain.com/ink-builder-program/office-hours) — direct Ink team support

---

## License

MIT © 2026 Inkflow
