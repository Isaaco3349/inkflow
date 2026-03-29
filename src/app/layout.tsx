import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inkflow — DeFi that speaks your language',
  description:
    'AI-powered DeFi onboarding on Inkonchain. Swap, earn, and borrow through natural conversation. No seed phrases. No gas confusion.',
  keywords: ['DeFi', 'Inkonchain', 'AI', 'crypto', 'Web3', 'Inkflow'],
  openGraph: {
    title: 'Inkflow — DeFi that speaks your language',
    description:
      'AI-powered DeFi onboarding on Inkonchain. No seed phrases. No gas confusion.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Inkflow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkflow — DeFi that speaks your language',
    description: 'AI-powered DeFi onboarding on Inkonchain.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
