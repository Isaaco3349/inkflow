import type { Viewport } from 'next'
import Chat from '@/components/Chat'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function Home() {
  return (
    <main className="flex h-screen w-screen bg-[#07050F] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <Chat />
      </div>
    </main>
  )
}