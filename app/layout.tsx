import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'India Startup Graveyard',
  description: 'Every failed Indian startup. How much money burned. Why they died.',
  openGraph: {
    title: 'India Startup Graveyard',
    description: 'Every failed Indian startup. How much money burned. Why they died.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
          <span className="font-bold text-lg neon-text tracking-wide">⚰ Graveyard</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/graveyard" className="hover:text-white transition-colors">All Startups</a>
          </div>
        </nav>
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  )
}
