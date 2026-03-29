import type { Metadata, Viewport } from 'next'
import { Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-head',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-mono',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Inkflow - DeFi that speaks your language',
  description: 'AI-powered DeFi onboarding on Inkonchain. Swap, earn, and borrow through natural conversation. No seed phrases. No gas confusion.',
  keywords: ['DeFi', 'Inkonchain', 'AI', 'crypto', 'Web3', 'Inkflow'],
  openGraph: {
    title: 'Inkflow - DeFi that speaks your language',
    description: 'AI-powered DeFi onboarding on Inkonchain. No seed phrases. No gas confusion.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Inkflow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkflow - DeFi that speaks your language',
    description: 'AI-powered DeFi onboarding on Inkonchain.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${syne.variable} ${jetbrainsMono.variable} h-full overflow-hidden bg-[#07050F]`}
      >
        {children}
      </body>
    </html>
  )
}