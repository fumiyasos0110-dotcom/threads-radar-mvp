import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Threads Radar',
  description: '競合投稿を収集・分析するThreads競合レーダー'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>
}
