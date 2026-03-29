# Inkflow 🟣

> **AI-powered DeFi onboarding on Inkonchain.**
> Swap, earn, and borrow through natural conversation. No seed phrases. No gas confusion.

[![Built on Inkonchain](https://img.shields.io/badge/Built%20on-Inkonchain-7B5FFF?style=flat-square)](https://inkonchain.com)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-B46EFF?style=flat-square)](https://anthropic.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=flat-square)](LICENSE)

---

## What is Inkflow?

Inkflow is the consumer-grade front door to DeFi on Inkonchain — Kraken's Layer 2 blockchain built on the OP Superchain.

Most DeFi products assume users already know what a seed phrase is, how gas works, and which protocol to pick. Inkflow assumes none of that. Instead, users type what they want in plain English and the AI handles everything: protocol selection, transaction construction, gas abstraction, and plain-English explanation before every confirmation.

**Target user:** A Kraken user who has heard of DeFi but has never touched it.

---

## Features

- **Email & social login** — No seed phrases. ZeroDev creates a smart wallet silently on first login.
- **Natural language DeFi** — "Swap $50 of ETH to USDC" or "Earn yield on my ETH" — Claude AI parses intent and executes.
- **Gasless transactions** — ERC-4337 paymasters absorb gas for new users. They never see a gas prompt.
- **Pre-flight explanations** — Every transaction explained in plain English before confirmation.
- **Risk dashboard** — Live liquidation risk, portfolio exposure, and yield comparisons.
- **Flexible fiat on-ramp** — Kraken, bank card, or Nigerian virtual dollar cards (Kuda, Grey, Geegpay) via Paystack and Flutterwave.

---

## Tech Stack

### Chain & Infrastructure
| Tool | Role |
|------|------|
| [Inkonchain](https://inkonchain.com) | L2 chain (OP Superchain, Kraken) |
| [ZeroDev](https://zerodev.app) | ERC-4337 smart accounts + paymasters |
| [Alchemy Account Kit](https://accountkit.alchemy.com) | Account abstraction SDK |
| [Safe](https://safe.global) | Smart account fallback |

### DeFi Protocols (live on Ink)
| Protocol | Role |
|----------|------|
| SuperSwap v3 | Token swaps |
| Velodrome | LP positions & yield |
| Aave / Tydro | Lending & borrowing |

### AI
| Tool | Role |
|------|------|
| [Claude API](https://anthropic.com) | Natural language intent parsing & explanation |

### Payments
| Tool | Role |
|------|------|
| [Paystack](https://paystack.com) | Primary — Nigerian cards, bank transfer, USSD, BVN |
| [Flutterwave](https://flutterwave.com) | Secondary — broader Africa, mobile money (MPesa, Airtel) |

### Frontend
| Tool | Role |
|------|------|
| Next.js 14 | App framework |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Viem + Wagmi | Blockchain client |

---

## Project Structure

```
inkflow/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main app UI
│   │   ├── layout.tsx                # Root layout + metadata
│   │   ├── globals.css               # Global styles
│   │   └── api/
│   │       ├── chat/route.ts         # Claude AI intent parsing
│   │       ├── paystack/route.ts     # Paystack init + verify
│   │       └── flutterwave/route.ts  # Flutterwave init + verify
│   ├── components/
│   │   ├── Chat.tsx                  # AI chat interface
│   │   ├── Navbar.tsx                # Top navigation
│   │   └── Sidebar.tsx               # Portfolio + quick actions
│   └── lib/
│       ├── zerodev.ts                # Smart wallet setup
│       ├── paystack.ts               # Paystack client helpers
│       └── flutterwave.ts            # Flutterwave client helpers
├── mobile/
│   └── COMING_SOON.md               # iOS + Android roadmap
├── .env.example                      # All required env vars
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [ZeroDev](https://dashboard.zerodev.app) project ID
- An [Anthropic](https://console.anthropic.com) API key
- A [Paystack](https://dashboard.paystack.com) account
- A [Flutterwave](https://dashboard.flutterwave.com) account

### 1. Clone the repo

```powershell
git clone https://github.com/YOUR_USERNAME/inkflow.git
cd inkflow
```

### 2. Install dependencies

```powershell
pnpm install
```

### 3. Set up environment variables

```powershell
Copy-Item .env.example .env.local
```

Then open `.env.local` in Cursor and fill in all the values. See `.env.example` for every key needed.

### 4. Run the development server

```powershell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All required variables are documented in `.env.example`. Key ones:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `ZERODEV_PROJECT_ID` | [dashboard.zerodev.app](https://dashboard.zerodev.app) |
| `ALCHEMY_API_KEY` | [dashboard.alchemy.com](https://dashboard.alchemy.com) |
| `PAYSTACK_SECRET_KEY` | [dashboard.paystack.com](https://dashboard.paystack.com) |
| `FLUTTERWAVE_SECRET_KEY` | [dashboard.flutterwave.com](https://dashboard.flutterwave.com) |

> **Never commit `.env.local` to GitHub.** It is already in `.gitignore`.

---

## Payment Integration

### Paystack (Primary — Nigeria first)
- Supports: cards, bank transfer, USSD, virtual cards, Apple Pay
- Nigerian virtual dollar cards that work: Kuda, Grey, Geegpay, Barter, Chipper Cash
- BVN verification available for added trust
- Test keys are sandboxed — no real money moves in dev

### Flutterwave (Secondary — broader Africa)
- Supports: cards, bank transfer, mobile money (MPesa, Airtel), USSD, Barter
- Covers 34+ African countries
- Use v3 API to start (v4 migration path documented in their docs)

### Payment flow
```
User taps "Add Funds"
  → Choose Paystack (NGN) or Flutterwave (other currencies)
  → Backend initializes transaction
  → User completes payment on checkout page
  → Webhook confirms success
  → USDC/ETH routed to ZeroDev wallet on Ink  ← TODO: bridge integration
```

---

## Mobile Apps

iOS and Android apps are on the roadmap. See [`mobile/COMING_SOON.md`](mobile/COMING_SOON.md) for details.

| Platform | Status |
|----------|--------|
| 🍎 App Store | 🔜 Coming Soon |
| 🤖 Google Play | 🔜 Coming Soon |

---

## Inkonchain Ecosystem

Inkflow is eligible for Inkonchain builder grants. Three programs to know:

- **Spark** — early-stage project funding
- **Forge** — growth-stage protocol support  
- **Echo** — ecosystem amplification

Apply at [inkonchain.com/builders](https://inkonchain.com/builders).

---

## Contributing

Contributions are welcome. Please open an issue before submitting a PR so we can discuss the change.

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a pull request

---

## License

MIT © 2026 Inkflow

---

Built on [Inkonchain](https://inkonchain.com) · Powered by [Claude AI](https://anthropic.com) · Part of the OP Superchain
