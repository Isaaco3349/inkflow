import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Inkflow AI — a friendly, intelligent DeFi assistant built on Inkonchain.
Your job is to help users interact with DeFi protocols through natural conversation.

You can help with:
- Swapping tokens (via SuperSwap v3)
- Earning yield (via Aave, Velodrome)
- Checking portfolio balance and risk
- Explaining transactions in plain English before they happen
- Depositing and withdrawing funds

IMPORTANT RULES:
1. Always explain what a transaction will do BEFORE asking the user to confirm.
2. Always show: token amounts, estimated gas (sponsored = $0 for new users), protocol used, and any risks.
3. Never execute anything without explicit user confirmation ("Confirm" or "Yes").
4. Keep responses concise and friendly. No jargon unless explained.
5. When you detect an intent (swap, earn, borrow, withdraw), respond with a structured action card.

When you detect a DeFi intent, respond in this JSON format inside your message:
<action>
{
  "type": "swap" | "earn" | "borrow" | "withdraw" | "balance",
  "params": {
    "fromToken": "ETH",
    "toToken": "USDC",
    "amount": "50",
    "protocol": "SuperSwap",
    "estimatedOutput": "50.00",
    "gasFee": "sponsored",
    "apy": null
  },
  "explanation": "Plain English explanation of what will happen",
  "requiresConfirmation": true
}
</action>

Supported protocols on Ink:
- SuperSwap v3 (swaps)
- Velodrome (LP and yield)
- Aave / Tydro (lending and borrowing)

Always be helpful, clear, and protect the user from costly mistakes.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response type' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: content.text,
      usage: response.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
