'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, ArrowRightLeft, TrendingUp, AlertCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  txPreview?: TxPreview | null
}

interface TxPreview {
  type: 'swap' | 'deposit' | 'info'
  data: Record<string, string>
  confirmed?: boolean
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: `Hey! I'm Inkflow AI 🟣\n\nI can help you swap tokens, earn yield, and manage your DeFi portfolio on Inkonchain — all through natural conversation.\n\nTry saying something like:\n• "swap $50 of ETH to USDC"\n• "earn yield on my USDC"\n• "what's my portfolio risk?"\n• "add funds with my card"`,
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for wallet events
  useEffect(() => {
    function handleConnected(e: Event) {
      setWalletAddress((e as CustomEvent<string>).detail)
    }
    function handleDisconnected() {
      setWalletAddress(null)
    }
    window.addEventListener('inkflow:wallet:connected', handleConnected)
    window.addEventListener('inkflow:wallet:disconnected', handleDisconnected)
    return () => {
      window.removeEventListener('inkflow:wallet:connected', handleConnected)
      window.removeEventListener('inkflow:wallet:disconnected', handleDisconnected)
    }
  }, [])

  // Listen for quick action prompts
  useEffect(() => {
    function handlePrompt(e: Event) {
      const prompt = (e as CustomEvent<string>).detail
      if (prompt) setInput(prompt)
    }
    function handleSubmit(e: Event) {
      const prompt = (e as CustomEvent<string>).detail
      if (prompt) sendMessage(prompt)
    }
    window.addEventListener('inkflow:prompt', handlePrompt)
    window.addEventListener('inkflow:submit', handleSubmit)
    return () => {
      window.removeEventListener('inkflow:prompt', handlePrompt)
      window.removeEventListener('inkflow:submit', handleSubmit)
    }
  }, [messages, loading])

  async function sendMessage(overrideInput?: string) {
    const trimmed = (overrideInput ?? input).trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      // 1. Parse intent with Claude
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages
            .filter((m) => m !== WELCOME_MESSAGE)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const intent = data.intent
      const explanation = data.explanation ?? 'I can help with that!'

      let txPreview: TxPreview | null = null

      // 2. If swap intent, get quote
      if (intent?.action === 'swap' && walletAddress) {
        const swapRes = await fetch('/api/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            fromToken: intent.fromToken ?? 'ETH',
            toToken: intent.toToken ?? 'USDC',
            amount: String(intent.amount ?? '50'),
          }),
        })
        const swapData = await swapRes.json()
        if (swapData.ok) {
          txPreview = {
            type: 'swap',
            data: {
              From: `${swapData.quote.amountIn ? (parseInt(swapData.quote.amountIn) / 1e18).toFixed(4) : intent.amount} ${swapData.quote.fromToken}`,
              To: `~${swapData.quote.estimatedAmountOut} ${swapData.quote.toToken}`,
              Route: swapData.quote.route,
              'Price impact': swapData.quote.priceImpact,
              Slippage: swapData.quote.slippage,
              'Gas fee': 'Sponsored ✓',
            },
          }
        }
      }

      // 3. If deposit/yield intent, get plan
      if ((intent?.action === 'deposit') && walletAddress) {
        const depRes = await fetch('/api/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            token: intent.token ?? 'USDC',
            amount: String(intent.amount ?? '100'),
            protocol: intent.protocol ?? 'aave',
          }),
        })
        const depData = await depRes.json()
        if (depData.ok) {
          txPreview = {
            type: 'deposit',
            data: {
              Protocol: depData.depositPlan.protocol.toUpperCase(),
              Token: depData.depositPlan.token,
              Amount: `$${depData.depositPlan.amount}`,
              APY: depData.depositPlan.apy,
              'Monthly earnings': depData.depositPlan.estimatedMonthlyEarnings,
              'Yearly earnings': depData.depositPlan.estimatedYearlyEarnings,
              'Gas fee': 'Sponsored ✓',
            },
          }
        }
      }

      setMessages([...history, {
        role: 'assistant',
        content: explanation,
        txPreview,
      }])
    } catch {
      setMessages([...history, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function confirmTransaction(msgIndex: number) {
    if (!walletAddress) {
      alert('Please connect your wallet first.')
      return
    }

    // Mark as confirmed in UI
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIndex && m.txPreview
          ? { ...m, txPreview: { ...m.txPreview, confirmed: true } }
          : m
      )
    )

    // TODO: Execute onchain via ZeroDev kernelClient
    // This is where Phase 3 plugs in
    alert('Transaction confirmed! Onchain execution coming in next update.')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Wallet warning */}
      {!walletAddress && (
        <div className="mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[rgba(123,95,255,0.08)] border border-[rgba(123,95,255,0.2)] text-xs text-[rgba(237,233,255,0.6)]">
          <AlertCircle className="w-3.5 h-3.5 text-[#B46EFF] shrink-0" />
          Connect your wallet to execute transactions on Ink
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] space-y-2`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#7B5FFF]/20 border border-[#7B5FFF]/30 text-[#EDE9FF] rounded-br-sm'
                    : 'bg-white/[0.04] border border-[rgba(123,95,255,0.18)] text-[#EDE9FF] rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-[10px] tracking-widest uppercase text-[#B46EFF] mb-2">
                    Inkflow AI
                  </div>
                )}
                {msg.content}
              </div>

              {/* Transaction Preview Card */}
              {msg.txPreview && (
                <div className="bg-[#0E0B1C] border border-[rgba(123,95,255,0.35)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#B46EFF]">
                    {msg.txPreview.type === 'swap'
                      ? <ArrowRightLeft className="w-3 h-3" />
                      : <TrendingUp className="w-3 h-3" />
                    }
                    {msg.txPreview.type === 'swap' ? 'Swap preview' : 'Deposit preview'}
                  </div>

                  <div className="space-y-1.5">
                    {Object.entries(msg.txPreview.data).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-[rgba(237,233,255,0.45)] font-mono">{key}</span>
                        <span className={`text-[#EDE9FF] font-mono ${val.includes('✓') ? 'text-[#B46EFF]' : ''}`}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!msg.txPreview.confirmed ? (
                    <button
                      onClick={() => confirmTransaction(i)}
                      className="w-full py-2 rounded-lg bg-[#7B5FFF] text-white text-xs font-bold hover:bg-[#9B83FF] transition-colors shadow-[0_4px_16px_rgba(123,95,255,0.4)]"
                    >
                      Confirm transaction →
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-lg bg-[rgba(123,95,255,0.2)] text-[#B46EFF] text-xs font-bold text-center border border-[rgba(123,95,255,0.3)]">
                      ✓ Confirmed — executing onchain
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-[rgba(123,95,255,0.18)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="text-[10px] tracking-widest uppercase text-[#B46EFF] mb-2">
                Inkflow AI
              </div>
              <Loader2 className="w-4 h-4 text-[#7B5FFF] animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[rgba(123,95,255,0.18)] px-4 py-4">
        <div className="flex items-end gap-3 bg-[#0E0B1C] border border-[rgba(123,95,255,0.25)] rounded-xl px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder='Say "swap $50 ETH to USDC" or "earn yield on my ETH"...'
            rows={1}
            className="flex-1 bg-transparent text-[#EDE9FF] text-sm placeholder:text-[rgba(237,233,255,0.3)] outline-none resize-none font-mono"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#7B5FFF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:bg-[#9B83FF]"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-[rgba(237,233,255,0.25)] text-center mt-2 tracking-wide">
          Built on Inkonchain · Gas sponsored for new users
        </p>
      </div>
    </div>
  )
}