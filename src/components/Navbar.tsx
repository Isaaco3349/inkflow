'use client'

import { useState } from 'react'

export default function Navbar() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  async function connectWallet() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('No wallet detected. Please install MetaMask or a Web3 wallet.')
      return
    }

    try {
      const eth = (window as any).ethereum
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setConnected(true)
        // Broadcast to Sidebar
        window.dispatchEvent(new CustomEvent('inkflow:wallet:connected', { detail: accounts[0] }))
      }
    } catch (err) {
      console.error('Wallet connection failed', err)
    }
  }

  function disconnectWallet() {
    setConnected(false)
    setAddress(null)
    window.dispatchEvent(new CustomEvent('inkflow:wallet:disconnected'))
  }

  function shortAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[rgba(123,95,255,0.18)] bg-[#07050F]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#7B5FFF] flex items-center justify-center shadow-[0_0_20px_rgba(123,95,255,0.4)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7C3 4.79 4.79 3 7 3s4 1.79 4 4-1.79 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="7" r="1.5" fill="#fff"/>
          </svg>
        </div>
        <span className="font-bold text-[#EDE9FF] tracking-tight text-base">Inkflow</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(123,95,255,0.25)] bg-[rgba(123,95,255,0.08)] text-xs text-[rgba(237,233,255,0.6)] font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-[#B46EFF] animate-pulse'}`} />
          <span className="hidden sm:inline">
            {connected && address ? shortAddress(address) : 'Not connected'}
          </span>
        </div>

        <button
          onClick={connected ? disconnectWallet : connectWallet}
          className="text-xs font-bold px-3 sm:px-4 py-2 rounded-lg bg-[#7B5FFF] text-white hover:bg-[#9B83FF] transition-colors shadow-[0_4px_16px_rgba(123,95,255,0.4)] whitespace-nowrap"
        >
          {connected ? 'Disconnect' : 'Connect wallet'}
        </button>
      </div>
    </header>
  )
}s