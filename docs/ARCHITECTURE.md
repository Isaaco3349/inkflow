# Inkflow — System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                     User (Browser)                       │
│         Email/Google login → Inkflow Web App             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Next.js App (Frontend)                   │
│   Chat UI · Dashboard · Portfolio · Onboarding flow      │
└──────┬──────────────────────┬───────────────────────────┘
       │  API Routes           │  Onchain reads (viem)
┌──────▼──────┐        ┌──────▼──────────────────────────┐
│  Claude API  │        │     Inkonchain (L2)              │
│  (intent     │        │  ┌──────────┐ ┌──────────────┐  │
│  parsing)    │        │  │SuperSwap │ │  Velodrome   │  │
└─────────────┘        │  └──────────┘ └──────────────┘  │
                        │  ┌──────────┐                    │
┌─────────────┐         │  │   Aave   │                    │
│  ZeroDev    │────────▶│  └──────────┘                    │
│  (ERC-4337  │         │                                  │
│  smart acct)│         │  Smart Account (user wallet)     │
└─────────────┘         └──────────────────────────────────┘

┌─────────────┐   ┌─────────────┐
│  Paystack   │   │ Flutterwave │   ← Fiat on-ramp
│  (Nigeria)  │   │  (Africa)   │
└──────┬──────┘   └──────┬──────┘
       │  webhook          │  webhook
       └──────────┬────────┘
            ┌─────▼─────┐
            │  Next.js  │  → credit user wallet on Ink
            │  Webhook  │
            │  Handler  │
            └───────────┘
```

## Request Flow — Natural Language Transaction

```
1. User types: "swap $50 of ETH to USDC"
        ↓
2. POST /api/chat → Claude API
   Returns: { action: "swap", fromToken: "ETH", toToken: "USDC", amount: 50 }
        ↓
3. Frontend shows pre-flight explanation + confirmation UI
        ↓
4. User taps "Confirm"
        ↓
5. ZeroDev kernelClient sends UserOperation to bundler
   - Gas sponsored by Paymaster (user pays $0)
   - SuperSwap v3 executes swap on Ink
        ↓
6. Transaction confirmed → UI updates balance
```

## Request Flow — Fiat On-Ramp (Nigeria)

```
1. User taps "Add Funds" → selects amount + Paystack
        ↓
2. POST /api/paystack/initialize (server-side)
   Returns: { authorization_url, reference }
        ↓
3. User redirected to Paystack checkout
   Pays via: virtual card / bank transfer / USSD
        ↓
4. Paystack sends webhook → POST /api/paystack/webhook
   - Signature verified
   - Transaction double-verified via Paystack API
        ↓
5. Backend credits equivalent USDC to user's
   ZeroDev smart wallet address on Ink
```

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Account Abstraction | ZeroDev | Best DX, gasless support, Ink Mainnet verified |
| AI model | Claude Sonnet | Best instruction following for structured JSON output |
| Payments primary | Paystack | Nigeria-first, Stripe-backed, BVN support |
| Payments secondary | Flutterwave | Pan-Africa, mobile money, broader coverage |
| UI components | shadcn/ui | Ink Kit was archived Oct 2025 |
| Chain | Inkonchain | Sub-1s blocks, ERC-4337 native, Kraken fiat rails |
