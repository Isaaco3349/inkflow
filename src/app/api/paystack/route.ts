import { NextRequest, NextResponse } from 'next/server'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE = 'https://api.paystack.co'

// ── Initialize a payment transaction ──────────────────────────────
async function initializeTransaction(
  email: string,
  amountNGN: number, // amount in kobo (NGN x 100)
  metadata: Record<string, unknown>
) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountNGN,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
    }),
  })
  return res.json()
}

// ── Verify a transaction after callback ───────────────────────────
async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    }
  )
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, amountNGN, reference, walletAddress } = body

    if (action === 'initialize') {
      if (!email || !amountNGN || !walletAddress) {
        return NextResponse.json(
          { error: 'email, amountNGN, and walletAddress are required' },
          { status: 400 }
        )
      }

      const result = await initializeTransaction(email, amountNGN * 100, {
        walletAddress,
        source: 'inkflow',
        purpose: 'defi_onramp',
      })

      if (!result.status) {
        return NextResponse.json(
          { error: result.message || 'Paystack initialization failed' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        authorizationUrl: result.data.authorization_url,
        reference: result.data.reference,
        accessCode: result.data.access_code,
      })
    }

    if (action === 'verify') {
      if (!reference) {
        return NextResponse.json(
          { error: 'reference is required' },
          { status: 400 }
        )
      }

      const result = await verifyTransaction(reference)

      if (!result.status || result.data.status !== 'success') {
        return NextResponse.json(
          { error: 'Transaction not successful', details: result.data?.status },
          { status: 400 }
        )
      }

      // TODO: After verification — mint/route USDC/ETH to user's ZeroDev wallet on Ink
      // This is where you call your smart contract or bridge service

      return NextResponse.json({
        success: true,
        amount: result.data.amount / 100, // convert kobo back to NGN
        currency: result.data.currency,
        channel: result.data.channel,
        reference: result.data.reference,
        paidAt: result.data.paid_at,
        customerEmail: result.data.customer.email,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Paystack API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── Webhook handler (Paystack sends events here) ──────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'No reference provided' }, { status: 400 })
  }

  const result = await verifyTransaction(reference)
  return NextResponse.json(result)
}
