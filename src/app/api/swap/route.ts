// src/app/api/swap/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { parseUnits } from 'viem'
import { z } from 'zod'

const schema = z.object({
  walletAddress: z.string().startsWith('0x'),
  fromToken: z.enum(['ETH', 'USDC.e', 'USDT0', 'WETH']),
  toToken:   z.enum(['ETH', 'USDC.e', 'USDT0', 'WETH']),
  amount:    z.string(),
  execute:   z.boolean().default(false), // false = preview, true = execute
  privateKey: z.string().optional(),     // only needed when execute=true
})

const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  'USDC.e': '0xF1815bd50389c46847f0Bda824eC8da914045D14',
  USDT0:    '0x0200C29006150606B650577BBE7B6248F58470c1',
  WETH:     '0x4200000000000000000000000000000000000006',
}

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const input = schema.parse(body)

    const decimals = input.fromToken === 'WETH' ? 18 : 6
    const amountIn = parseUnits(input.amount, decimals)

    // Preview mode — return quote without executing
    if (!input.execute) {
      return NextResponse.json({
        ok: true,
        quote: {
          fromToken:            input.fromToken,
          toToken:              input.toToken,
          amountIn:             amountIn.toString(),
          estimatedAmountOut:   (parseFloat(input.amount) * 0.998).toFixed(6),
          priceImpact:          '0.05%',
          route:                'SuperSwap v3',
          gasEstimate:          '0',
          slippage:             '0.5%',
          walletAddress:        input.walletAddress,
          tokenInAddress:       TOKEN_ADDRESSES[input.fromToken] ?? 'ETH',
          tokenOutAddress:      TOKEN_ADDRESSES[input.toToken]   ?? 'ETH',
        },
      })
    }

    // Execute mode — wire to ZeroDev (active once SuperSwap address confirmed)
    if (input.execute && input.privateKey) {
      const { executeSwap } = await import('@/lib/execute')
      const txHash = await executeSwap({
        privateKey:       input.privateKey as `0x${string}`,
        fromToken:        input.fromToken,
        toToken:          input.toToken,
        amountIn:         input.amount,
        recipientAddress: input.walletAddress as `0x${string}`,
      })
      return NextResponse.json({ ok: true, txHash })
    }

    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  } catch (err: any) {
    console.error('[/api/swap]', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}