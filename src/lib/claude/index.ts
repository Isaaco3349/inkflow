// src/lib/claude/index.ts
// Claude API client for DeFi intent parsing
// Docs: https://docs.anthropic.com

import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ── DeFi intent types ─────────────────────────────────────────────────────────
export type DeFiIntent =
  | { action: "swap";    fromToken: string; toToken: string; amount: number; amountIn: "USD" | "TOKEN" }
  | { action: "deposit"; protocol: string; token: string;   amount: number }
  | { action: "borrow";  protocol: string; token: string;   amount: number }
  | { action: "repay";   protocol: string; token: string;   amount: number }
  | { action: "withdraw";protocol: string; token: string;   amount: number }
  | { action: "balance" }
  | { action: "yields" }
  | { action: "unknown"; message: string }

// ── Parse a natural language DeFi instruction ─────────────────────────────────
export async function parseDeFiIntent(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<{ intent: DeFiIntent; explanation: string }> {

  const systemPrompt = `You are Inkflow AI, a friendly DeFi assistant built on Inkonchain.
Your job is to:
1. Parse the user's natural language instruction into a structured DeFi intent
2. Provide a clear, plain-English explanation of what will happen

Available protocols on Ink:
- SuperSwap v3 (token swaps)
- Velodrome (liquidity pools, LP yield)
- Aave / Tydro (lending and borrowing)

Supported tokens: ETH, USDC, USDT, wETH, and major Ink ecosystem tokens.

ALWAYS respond with valid JSON in this exact format:
{
  "intent": {
    "action": "swap" | "deposit" | "borrow" | "repay" | "withdraw" | "balance" | "yields" | "unknown",
    // include relevant fields based on action
  },
  "explanation": "Plain English explanation of what will happen, written for a crypto beginner. Mention the protocol, amount, and any risks."
}

Be friendly, concise, and reassuring. Never use jargon without explaining it.`

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""

  try {
    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)
    return parsed as { intent: DeFiIntent; explanation: string }
  } catch {
    return {
      intent: { action: "unknown", message: "Could not parse intent" },
      explanation: "I didn't quite understand that. Could you rephrase? For example: 'swap $50 of ETH to USDC' or 'earn yield on my USDC'.",
    }
  }
}
