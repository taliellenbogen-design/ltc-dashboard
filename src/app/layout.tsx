import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Long-Term Commitment Dashboard',
  description: 'Track annual customer contracts and commitments',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
