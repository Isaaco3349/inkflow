/**
 * lib/flutterwave.ts
 * Flutterwave client helpers for Inkflow frontend.
 * Secondary payment layer — broader Africa, mobile money.
 *
 * Docs: https://developer.flutterwave.com/docs
 * Supported: card, bank transfer, mobile money (MPesa, Airtel), USSD, Barter
 */

export interface FlutterwaveInitParams {
  email: string
  name: string
  phone?: string
  amount: number
  currency?: string  // default: 'NGN'
  walletAddress: string
}

export interface FlutterwaveInitResponse {
  paymentLink: string
  txRef: string
}

// ── Initialize a Flutterwave payment from the frontend ─────────────
export async function initializeFlutterwavePayment(
  params: FlutterwaveInitParams
): Promise<FlutterwaveInitResponse> {
  const res = await fetch('/api/flutterwave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'initialize', ...params }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to initialize Flutterwave payment')
  }

  return res.json()
}

// ── Verify a completed Flutterwave transaction ─────────────────────
export async function verifyFlutterwaveTransaction(transactionId: string) {
  const res = await fetch('/api/flutterwave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', transactionId }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to verify Flutterwave transaction')
  }

  return res.json()
}

// ── Redirect user to Flutterwave checkout page ─────────────────────
export function redirectToFlutterwaveCheckout(paymentLink: string) {
  window.location.href = paymentLink
}

// ── Supported currencies ───────────────────────────────────────────
export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
]

// ── Supported mobile money providers ──────────────────────────────
export const MOBILE_MONEY_PROVIDERS = [
  { name: 'MPesa', countries: ['KE', 'TZ', 'GH'] },
  { name: 'Airtel Money', countries: ['KE', 'UG', 'TZ'] },
  { name: 'MTN Mobile Money', countries: ['GH', 'UG', 'ZM'] },
]
