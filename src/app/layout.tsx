import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VibeSafe — GitHub Security Scanner',
  description: 'Scan your GitHub repo for exposed API keys, secrets, and sensitive data. Built for vibe coders.',
  openGraph: {
    title: 'VibeSafe — GitHub Security Scanner',
    description: 'Is your repo safe? Find out in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
