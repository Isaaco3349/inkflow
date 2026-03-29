'use client'

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[rgba(123,95,255,0.18)] bg-[#07050F]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-7 h-7 rounded-lg bg-[#7B5FFF] flex items-center justify-center shadow-[0_0_20px_rgba(123,95,255,0.4)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7C3 4.79 4.79 3 7 3s4 1.79 4 4-1.79 4-4 4"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="7" cy="7" r="1.5" fill="#fff" />
          </svg>
        </div>
        <span className="font-bold text-[#EDE9FF] tracking-tight text-base">
          Inkflow
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Wallet status placeholder */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(123,95,255,0.25)] bg-[rgba(123,95,255,0.08)] text-xs text-[rgba(237,233,255,0.6)] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B46EFF] animate-pulse" />
          Not connected
        </div>

        <button className="text-xs font-bold px-4 py-2 rounded-lg bg-[#7B5FFF] text-white hover:bg-[#9B83FF] transition-colors shadow-[0_4px_16px_rgba(123,95,255,0.4)]">
          Connect wallet
        </button>
      </div>
    </header>
  )
}
