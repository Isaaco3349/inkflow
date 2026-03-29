// src/lib/flutterwave/index.ts
// Flutterwave server-side wrapper (v3 API)
// Docs: https://developer.flutterwave.com/docs

import crypto from "crypto"

const FLW_SECRET = process.env.FLW_SECRET_KEY!
const BASE_URL = "https://api.flutterwave.com/v3"

const headers = {
  Authorization: `Bearer ${FLW_SECRET}`,
  "Content-Type": "application/json",
}

// ── Initialize a Standard payment ────────────────────────────────────────────
// Supports: card, bank transfer, mobile money (Mpesa, Airtel), USSD, virtual cards
export async function initializePayment({
  tx_ref,           // unique reference you generate per transaction
  amount,
  currency = "NGN",
  redirect_url,
  customer,
  payment_options = "card, banktransfer, mobilemoney, ussd",
  meta = {},
}: {
  tx_ref: string
  amount: number
  currency?: "NGN" | "USD" | "GHS" | "KES" | "ZAR" | "UGX" | "TZS"
  redirect_url: string
  customer: { email: string; name: string; phone_number?: string }
  payment_options?: string
  meta?: Record<string, unknown>
}) {
  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      tx_ref,
      amount,
      currency,
      redirect_url,
      customer,
      payment_options,
      meta,
      customizations: {
        title: "Inkflow",
        description: "Fund your Inkflow wallet",
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    }),
  })

  const data = await res.json()

  if (data.status !== "success") {
    throw new Error(`Flutterwave init failed: ${data.message}`)
  }

  // Returns payment link to redirect user to
  return data.data as { link: string }
}

// ── Verify a transaction ──────────────────────────────────────────────────────
export async function verifyTransaction(transaction_id: string) {
  const res = await fetch(
    `${BASE_URL}/transactions/${transaction_id}/verify`,
    { headers }
  )

  const data = await res.json()

  if (data.status !== "success") {
    throw new Error(`Flutterwave verify failed: ${data.message}`)
  }

  return data.data as {
    status: "successful" | "failed" | "pending"
    amount: number
    currency: string
    customer: { email: string; name: string }
    tx_ref: string
    flw_ref: string
  }
}

// ── Verify webhook signature ──────────────────────────────────────────────────
export function verifyWebhookSignature(signature: string): boolean {
  return signature === process.env.FLW_WEBHOOK_SECRET
}
