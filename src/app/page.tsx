import Chat from '@/components/Chat'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  return (
    <main className="flex h-screen bg-[#07050F] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <Chat />
      </div>
    </main>
  )
}
