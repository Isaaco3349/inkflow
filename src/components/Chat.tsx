'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: `Hey! I'm Inkflow AI 🟣\n\nI can help you swap tokens, earn yield, and manage your DeFi portfolio on Inkonchain — all through natural conversation.\n\nTry saying something like:\n• "swap $50 of ETH to USDC"\n• "earn yield on my USDC"\n• "what's my portfolio risk?"\n• "add funds with my card"`,
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]

    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.filter((m) => m.role !== 'assistant' || m !== WELCOME_MESSAGE),
        }),
      })

      const data = await res.json()

      if (data.message) {
        setMessages([...history, { role: 'assistant', content: data.message }])
      }
    } catch {
      setMessages([
        ...history,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
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

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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
            onClick={sendMessage}
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
