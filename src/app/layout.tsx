import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'

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
    <html lang="nl">
      <body className="min-h-screen bg-[#0a0a0f] text-slate-200">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
