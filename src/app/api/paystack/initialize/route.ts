// src/app/api/paystack/initialize/route.ts
// POST /api/paystack/initialize — start a Paystack payment session

import { NextRequest, NextResponse } from "next/server"
import { initializeTransaction } from "@/lib/paystack"
import { z } from "zod"

const schema = z.object({
  email:    z.string().email(),
  amount:   z.number().positive(),   // in USD — we convert to kobo below
  currency: z.enum(["NGN", "USD"]).default("NGN"),
  metadata: z.record(z.unknown()).optional().default({}),
})

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const input = schema.parse(body)

    // Paystack expects amounts in the smallest currency unit
    // NGN: naira → kobo (*100), USD: dollars → cents (*100)
    const amount = Math.round(input.amount * 100)

    const result = await initializeTransaction({
      email:        input.email,
      amount,
      currency:     input.currency,
      metadata:     input.metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=paystack`,
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error("[/api/paystack/initialize]", err)
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
