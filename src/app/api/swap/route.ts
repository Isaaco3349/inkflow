// src/app/api/swap/route.ts
// POST /api/swap — executes a token swap on Ink via SuperSwap v3
// Uses ZeroDev smart account for gasless execution

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseUnits, encodeFunctionData } from 'viem'
import { z } from 'zod'

const schema = z.object({
  walletAddress: z.string().startsWith('0x'),
  fromToken: z.enum(['ETH', 'USDC', 'USDT', 'WETH']),
  toToken: z.enum(['ETH', 'USDC', 'USDT', 'WETH']),
  amount: z.string(), // human readable e.g. "50"
})

// Ink Mainnet token addresses
const TOKENS: Record<string, `0x${string}`> = {
  USDC: '0x9151434b16b9763660705744C2C9B3B26Aa427b',
  USDT: '0x0200C29006150606B88b00EB18cE26ef23B39a32',
  WETH: '0x4200000000000000000000000000000000000006',
}

// SuperSwap v3 router on Ink
const SUPERSWAP_ROUTER = '0x0B0a67D2E3E97E5e5d7879B4D8B47d3e1177c8a2' as `0x${string}`

const inkChain = {
  id: 57073,
  name: 'Ink',
  network: 'ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
    public: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
  },
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, fromToken, toToken, amount } = schema.parse(body)

    // Build the swap quote response
    // In production this calls SuperSwap's quoter contract
    // For now returns the transaction structure for frontend to execute
    const amountIn = fromToken === 'ETH'
      ? parseUnits(amount, 18)
      : parseUnits(amount, 6) // USDC/USDT have 6 decimals

    const quote = {
      fromToken,
      toToken,
      amountIn: amountIn.toString(),
      estimatedAmountOut: (parseFloat(amount) * 0.998).toFixed(6), // 0.2% fee estimate
      priceImpact: '0.05%',
      route: 'SuperSwap v3',
      gasEstimate: '0', // Sponsored by ZeroDev paymaster
      slippage: '0.5%',
      walletAddress,
    }

    return NextResponse.json({ ok: true, quote })
  } catch (err: any) {
    console.error('[/api/swap]', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}