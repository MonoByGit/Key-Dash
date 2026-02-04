import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI API Dashboard',
  description: 'Manage your AI API keys and usage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-200">{children}</body>
    </html>
  )
}
