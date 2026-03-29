// src/app/api/chat/route.ts
// POST /api/chat — parses natural language DeFi instructions via Claude

import { NextRequest, NextResponse } from "next/server"
import { parseDeFiIntent } from "@/lib/claude"
import { z } from "zod"

const schema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional()
    .default([]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history } = schema.parse(body)

    const result = await parseDeFiIntent(message, history)

    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error("[/api/chat]", err)
    return NextResponse.json(
      { ok: false, error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}
