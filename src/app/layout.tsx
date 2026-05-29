import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'VibeShield — GitHub Security Scanner',
  description: 'Scan your GitHub repo for exposed API keys, secrets, and sensitive data. Built for vibe coders.',
  openGraph: {
    title: 'VibeShield — GitHub Security Scanner',
    description: 'Is your repo safe? Find out in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}