// src/types/index.ts

// ── User ──────────────────────────────────────────────────────────────────────
export interface InkflowUser {
  id:            string
  email:         string
  name?:         string
  walletAddress: string   // ZeroDev smart account address on Ink
  createdAt:     string
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface TokenBalance {
  symbol:   string
  name:     string
  address:  string
  balance:  string        // raw onchain balance
  usdValue: number
  decimals: number
}

export interface Portfolio {
  totalUsdValue:   number
  tokens:          TokenBalance[]
  totalYieldEarned: number
  avgApy:           number
}

// ── Chat / AI ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id:        string
  role:      "user" | "assistant"
  content:   string
  intent?:   import("@/lib/claude").DeFiIntent
  timestamp: Date
  status?:   "pending" | "confirmed" | "failed"
}

// ── Payments ──────────────────────────────────────────────────────────────────
export type PaymentProvider = "paystack" | "flutterwave"
export type PaymentStatus   = "pending" | "success" | "failed"

export interface PaymentSession {
  provider:     PaymentProvider
  reference:    string
  amount:       number
  currency:     string
  status:       PaymentStatus
  userEmail:    string
  createdAt:    Date
}

// ── DeFi Positions ────────────────────────────────────────────────────────────
export interface YieldPosition {
  protocol:        "aave" | "velodrome" | "superswap"
  token:           string
  depositedAmount: number
  currentValue:    number
  apy:             number
  earnedYield:     number
}

export interface BorrowPosition {
  protocol:          "aave"
  token:             string
  borrowedAmount:    number
  collateral:        string
  collateralAmount:  number
  healthFactor:      number       // <1 = liquidatable
  liquidationRisk:   "low" | "medium" | "high"
}
// ── ERC-8004 ────────────────────────────────────────────────────────────────
export interface AgentIdentity {
  agentId:       bigint
  registryTx:    string
  agentURI:      string
  walletAddress: string
}

export interface TradeValidation {
  intentHash:  string
  signature:   string
  agentId:     string
  timestamp:   number
  action:      string
  txHash?:     string
  verified:    boolean
}