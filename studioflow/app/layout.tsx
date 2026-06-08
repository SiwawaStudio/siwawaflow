import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudioFlow — Gestion de projet',
  description: 'Plateforme de gestion de projet pour designers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
