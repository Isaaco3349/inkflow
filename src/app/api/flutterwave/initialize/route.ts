// src/app/api/flutterwave/initialize/route.ts
// POST /api/flutterwave/initialize — start a Flutterwave payment

import { NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/flutterwave"
import { z } from "zod"
import { randomUUID } from "crypto"

const schema = z.object({
  email:    z.string().email(),
  name:     z.string().min(1),
  amount:   z.number().positive(),
  currency: z.enum(["NGN", "USD", "GHS", "KES", "ZAR"]).default("NGN"),
  phone:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const input = schema.parse(body)

    // Generate a unique transaction reference
    const tx_ref = `inkflow-${randomUUID()}`

    const result = await initializePayment({
      tx_ref,
      amount:   input.amount,
      currency: input.currency,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=flutterwave`,
      customer: {
        email:        input.email,
        name:         input.name,
        phone_number: input.phone,
      },
      // Accept: cards, bank transfer, mobile money, USSD
      payment_options: "card, banktransfer, mobilemoney, ussd",
      meta: { tx_ref },
    })

    return NextResponse.json({ ok: true, payment_link: result.link, tx_ref })
  } catch (err: any) {
    console.error("[/api/flutterwave/initialize]", err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
