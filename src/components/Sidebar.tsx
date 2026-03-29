'use client'

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
  function handleQuickAction(prompt: string) {
    // Dispatch custom event to Chat component
    window.dispatchEvent(new CustomEvent('inkflow:prompt', { detail: prompt }))
  }

  return (
    <aside className="w-72 border-r border-[rgba(123,95,255,0.18)] bg-[#0E0B1C] flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(123,95,255,0.18)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7B5FFF] flex items-center justify-center">
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
        <div className="text-2xl font-bold text-[#EDE9FF] tracking-tight">$2,847.50</div>
        <div className="text-[11px] text-[#B46EFF] mt-1">↑ +$124.30 today · 4.6% avg APY</div>
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
