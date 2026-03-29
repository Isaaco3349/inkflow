// src/lib/paystack/index.ts
// Paystack server-side SDK wrapper
// Docs: https://paystack.com/docs/api

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const BASE_URL = "https://api.paystack.co"

const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  "Content-Type": "application/json",
}

// ── Initialize a transaction ──────────────────────────────────────────────────
// Call this from your API route — NEVER from the frontend (exposes secret key)
export async function initializeTransaction({
  email,
  amount,       // in kobo (naira * 100) or cents (USD * 100)
  currency = "NGN",
  metadata = {},
  callback_url,
}: {
  email: string
  amount: number
  currency?: "NGN" | "USD" | "GHS" | "ZAR"
  metadata?: Record<string, unknown>
  callback_url?: string
}) {
  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, amount, currency, metadata, callback_url }),
  })

  const data = await res.json()

  if (!data.status) {
    throw new Error(`Paystack init failed: ${data.message}`)
  }

  // Returns: { authorization_url, access_code, reference }
  return data.data as {
    authorization_url: string
    access_code: string
    reference: string
  }
}

// ── Verify a transaction ──────────────────────────────────────────────────────
// Always verify server-side after payment callback — never trust client data
export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers }
  )

  const data = await res.json()

  if (!data.status) {
    throw new Error(`Paystack verify failed: ${data.message}`)
  }

  return data.data as {
    status: "success" | "failed" | "abandoned"
    amount: number
    currency: string
    customer: { email: string }
    reference: string
    paid_at: string
  }
}

// ── Verify webhook signature ──────────────────────────────────────────────────
// Use this in your webhook route to confirm the event came from Paystack
import crypto from "crypto"

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(payload)
    .digest("hex")
  return hash === signature
}
