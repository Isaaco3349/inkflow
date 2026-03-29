import { NextRequest, NextResponse } from 'next/server'

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY!
const FLW_BASE = 'https://api.flutterwave.com/v3'

// ── Initialize a Flutterwave Standard payment ─────────────────────
async function initializePayment(payload: {
  tx_ref: string
  amount: number
  currency: string
  redirect_url: string
  customer: { email: string; name: string; phonenumber?: string }
  meta: Record<string, unknown>
  payment_options?: string
}) {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// ── Verify a transaction by tx_ref or transaction id ──────────────
async function verifyTransaction(transactionId: string) {
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
    },
  })
  return res.json()
}

function generateTxRef(): string {
  return `INKFLOW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      email,
      name,
      phone,
      amount,
      currency = 'NGN',
      transactionId,
      walletAddress,
    } = body

    if (action === 'initialize') {
      if (!email || !amount || !walletAddress || !name) {
        return NextResponse.json(
          { error: 'email, name, amount, and walletAddress are required' },
          { status: 400 }
        )
      }

      const tx_ref = generateTxRef()

      const result = await initializePayment({
        tx_ref,
        amount,
        currency,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/flutterwave/verify`,
        customer: {
          email,
          name,
          phonenumber: phone,
        },
        meta: {
          walletAddress,
          source: 'inkflow',
          purpose: 'defi_onramp',
        },
        // Supports: card, banktransfer, ussd, mobilemoney, barter
        payment_options: 'card, banktransfer, ussd, mobilemoney, barter',
      })

      if (result.status !== 'success') {
        return NextResponse.json(
          { error: result.message || 'Flutterwave initialization failed' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        paymentLink: result.data.link,
        txRef: tx_ref,
      })
    }

    if (action === 'verify') {
      if (!transactionId) {
        return NextResponse.json(
          { error: 'transactionId is required' },
          { status: 400 }
        )
      }

      const result = await verifyTransaction(transactionId)

      if (result.status !== 'success' || result.data.status !== 'successful') {
        return NextResponse.json(
          {
            error: 'Transaction not successful',
            details: result.data?.status,
          },
          { status: 400 }
        )
      }

      // TODO: After verification — mint/route USDC/ETH to user's ZeroDev wallet on Ink
      // This is where you call your smart contract or bridge service

      return NextResponse.json({
        success: true,
        amount: result.data.amount,
        currency: result.data.currency,
        paymentMethod: result.data.payment_type,
        txRef: result.data.tx_ref,
        transactionId: result.data.id,
        customerEmail: result.data.customer.email,
        chargedAt: result.data.created_at,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Flutterwave API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── Flutterwave webhook handler ───────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get('transaction_id')
  const status = searchParams.get('status')

  if (status !== 'successful' || !transactionId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?payment=failed`
    )
  }

  const result = await verifyTransaction(transactionId)

  if (result.status === 'success' && result.data.status === 'successful') {
    // TODO: credit wallet on Ink
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?payment=success`
    )
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}?payment=failed`
  )
}
