/**
 * lib/paystack.ts
 * Paystack client helpers for Inkflow frontend.
 * Used in components to trigger payments.
 *
 * Docs: https://paystack.com/docs/api
 * Primary use: Nigerian users — card, bank transfer, USSD, virtual cards
 */

export interface PaystackInitParams {
  email: string
  amountNGN: number  // in Naira (not kobo — API route handles conversion)
  walletAddress: string
}

export interface PaystackInitResponse {
  authorizationUrl: string
  reference: string
  accessCode: string
}

// ── Initialize a Paystack payment from the frontend ───────────────
export async function initializePaystackPayment(
  params: PaystackInitParams
): Promise<PaystackInitResponse> {
  const res = await fetch('/api/paystack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'initialize', ...params }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to initialize Paystack payment')
  }

  return res.json()
}

// ── Verify a completed Paystack transaction ────────────────────────
export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch('/api/paystack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', reference }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to verify Paystack transaction')
  }

  return res.json()
}

// ── Redirect user to Paystack checkout page ────────────────────────
export function redirectToPaystackCheckout(authorizationUrl: string) {
  window.location.href = authorizationUrl
}

// ── Supported virtual card providers in Nigeria ───────────────────
export const NIGERIAN_VIRTUAL_CARD_PROVIDERS = [
  { name: 'Kuda', type: 'Visa', supported: true },
  { name: 'Grey', type: 'Visa', supported: true },
  { name: 'Geegpay', type: 'Mastercard', supported: true },
  { name: 'Barter by Flutterwave', type: 'Visa', supported: true },
  { name: 'Chipper Cash', type: 'Visa', supported: true },
  { name: 'Payday', type: 'Visa', supported: false, note: 'Blocks crypto platforms' },
  { name: 'Verve (local)', type: 'Verve', supported: false, note: 'Nigeria-only, not international' },
]
