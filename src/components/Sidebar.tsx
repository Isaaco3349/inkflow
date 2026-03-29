'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, http, formatEther } from 'viem'

const inkChain = {
  id: 57073,
  name: 'Ink',
  network: 'ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
    public: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
  },
} as const

const publicClient = createPublicClient({
  chain: inkChain as any,
  transport: http(),
})

const QUICK_ACTIONS = [
  { label: 'Swap tokens', prompt: 'swap $50 of ETH to USDC' },
  { label: 'Earn yield', prompt: 'earn yield on my USDC' },
  { label: 'Check risk', prompt: "what's my portfolio risk?" },
  { label: 'Add funds', prompt: 'add funds with my Nigerian card' },
  { label: 'Borrow', prompt: 'borrow USDC against my ETH' },
]

const YIELD_DATA = [
  { protocol: 'AAVE · USDC', apy: '5.2%' },
  { protocol: 'VELODROME · ETH-USDC', apy: '11.8%' },
  { protocol: 'SUPERSWAP · wETH', apy: '3.6%' },
]

export default function Sidebar() {
  const [address, setAddress] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  const [ethPrice, setEthPrice] = useState<number>(3500)
  const [loading, setLoading] = useState(false)

  // Listen for wallet connection from Navbar
  useEffect(() => {
    function handleWalletConnected(e: Event) {
      const addr = (e as CustomEvent<string>).detail
      setAddress(addr)
    }
    function handleWalletDisconnected() {
      setAddress(null)
      setEthBalance(null)
    }
    window.addEventListener('inkflow:wallet:connected', handleWalletConnected)
    window.addEventListener('inkflow:wallet:disconnected', handleWalletDisconnected)
    return () => {
      window.removeEventListener('inkflow:wallet:connected', handleWalletConnected)
      window.removeEventListener('inkflow:wallet:disconnected', handleWalletDisconnected)
    }
  }, [])

  // Fetch real ETH balance when address changes
  useEffect(() => {
    if (!address) return
    setLoading(true)
    publicClient
      .getBalance({ address: address as `0x${string}` })
      .then((bal) => {
        const eth = parseFloat(formatEther(bal)).toFixed(4)
        setEthBalance(eth)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [address])

  // Fetch live ETH price
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then((r) => r.json())
      .then((d) => setEthPrice(d?.ethereum?.usd ?? 3500))
      .catch(() => setEthPrice(3500))
  }, [])

  const usdValue = ethBalance
    ? (parseFloat(ethBalance) * ethPrice).toFixed(2)
    : null

  function handleQuickAction(prompt: string) {
    window.dispatchEvent(new CustomEvent('inkflow:prompt', { detail: prompt }))
    window.dispatchEvent(new CustomEvent('inkflow:submit', { detail: prompt }))
  }

  return (
    <aside className="w-64 shrink-0 border-r border-[rgba(123,95,255,0.18)] bg-[#0E0B1C] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(123,95,255,0.18)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7B5FFF] flex items-center justify-center shadow-[0_0_12px_rgba(123,95,255,0.4)]">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 7C3 4.79 4.79 3 7 3s4 1.79 4 4-1.79 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7" cy="7" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <span className="font-bold text-[#EDE9FF] text-sm tracking-tight">Inkflow</span>
        </div>
      </div>

      {/* Portfolio snapshot */}
      <div className="px-5 py-5 border-b border-[rgba(123,95,255,0.18)]">
        <div className="text-[9px] tracking-widest uppercase text-[rgba(237,233,255,0.3)] mb-3">
          Portfolio
        </div>
        {loading ? (
          <div className="text-[#B46EFF] text-xs animate-pulse">Loading balance...</div>
        ) : address && usdValue ? (
          <>
            <div className="text-2xl font-bold text-[#EDE9FF] tracking-tight">
              ${usdValue}
            </div>
            <div className="text-[11px] text-[#B46EFF] mt-1">
              {ethBalance} ETH · Live on Ink
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-[rgba(237,233,255,0.3)] tracking-tight">
              $0.00
            </div>
            <div className="text-[11px] text-[rgba(237,233,255,0.3)] mt-1">
              Connect wallet to see balance
            </div>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-5 py-4 border-b border-[rgba(123,95,255,0.18)]">
        <div className="text-[9px] tracking-widest uppercase text-[rgba(237,233,255,0.3)] mb-3">
          Quick actions
        </div>
        <div className="space-y-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              className="w-full text-left text-xs text-[rgba(237,233,255,0.55)] hover:text-[#EDE9FF] hover:bg-[rgba(123,95,255,0.1)] px-3 py-2 rounded-lg transition-all border border-transparent hover:border-[rgba(123,95,255,0.2)]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Yield table */}
      <div className="px-5 py-4 flex-1">
        <div className="text-[9px] tracking-widest uppercase text-[rgba(237,233,255,0.3)] mb-3">
          Best yields now
        </div>
        <div className="space-y-2">
          {YIELD_DATA.map((row) => (
            <div
              key={row.protocol}
              className="flex justify-between items-center py-2 border-b border-[rgba(123,95,255,0.1)] last:border-0"
            >
              <span className="text-[10px] text-[rgba(237,233,255,0.45)] font-mono">
                {row.protocol}
              </span>
              <span className="text-sm font-bold bg-gradient-to-r from-[#9B83FF] to-[#B46EFF] bg-clip-text text-transparent">
                {row.apy}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[rgba(123,95,255,0.18)]">
        <div className="text-[9px] text-[rgba(237,233,255,0.2)] tracking-wide">
          Built on Inkonchain · Powered by Claude AI
        </div>
      </div>
    </aside>
  )
}