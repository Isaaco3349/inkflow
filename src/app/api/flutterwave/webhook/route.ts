// src/app/api/flutterwave/webhook/route.ts
// POST /api/flutterwave/webhook — handle Flutterwave payment events
// Set this URL in your Flutterwave dashboard → Settings → Webhooks

import { NextRequest, NextResponse } from "next/server"
import { verifyTransaction, verifyWebhookSignature } from "@/lib/flutterwave"

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash") || ""

  // 1. Verify the request came from Flutterwave
  if (!verifyWebhookSignature(signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = await req.json()

  // 2. Only handle successful payments
  if (event.event !== "charge.completed") {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const { id: transaction_id, tx_ref, status } = event.data

  if (status !== "successful") {
    return NextResponse.json({ ok: false, error: "Payment not successful" }, { status: 400 })
  }

  // 3. Double-verify server-side
  const verified = await verifyTransaction(String(transaction_id))

  if (verified.status !== "successful") {
    console.warn("[Flutterwave webhook] Could not verify:", tx_ref)
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 400 })
  }

  // 4. TODO: credit user's Inkflow wallet
  // - Look up user by verified.customer.email
  // - Convert verified.amount + verified.currency to USDC
  // - Route to their ZeroDev smart wallet address on Ink
  console.log(`[Flutterwave] Payment confirmed: ${verified.amount} ${verified.currency} from ${verified.customer.email}`)

  return NextResponse.json({ ok: true })
}
