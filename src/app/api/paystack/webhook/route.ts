// src/app/api/paystack/webhook/route.ts
// POST /api/paystack/webhook — handle Paystack payment events
// Set this URL in your Paystack dashboard → Settings → Webhooks

import { NextRequest, NextResponse } from "next/server"
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack"

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature") || ""
  const rawBody   = await req.text()

  // 1. Verify the request genuinely came from Paystack
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  // 2. Only handle successful charge events
  if (event.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const { reference, amount, currency, customer } = event.data

  // 3. Double-verify the transaction server-side (never trust webhook data alone)
  const verified = await verifyTransaction(reference)

  if (verified.status !== "success") {
    console.warn("[Paystack webhook] Transaction not successful:", reference)
    return NextResponse.json({ ok: false, error: "Transaction not successful" }, { status: 400 })
  }

  // 4. TODO: credit user's Inkflow wallet
  // - Look up user by customer.email
  // - Convert amount (kobo) to USD/USDC
  // - Route USDC to their ZeroDev smart wallet address on Ink
  console.log(`[Paystack] Payment confirmed: ${verified.amount / 100} ${verified.currency} from ${verified.customer.email}`)

  return NextResponse.json({ ok: true })
}
