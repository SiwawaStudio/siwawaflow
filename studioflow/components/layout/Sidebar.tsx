'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navMain = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '▦' },
  { href: '/taches', label: 'Toutes les tâches', icon: '☑' },
  { href: '/timeline', label: 'Timeline', icon: '▤' },
]

const navBottom = [
  { href: '/client', label: 'Vue client', icon: '◎' },
  { href: '/parametres', label: 'Paramètres', icon: '⚙' },
]

interface SidebarProps {
  projets?: { id: string; nom: string; couleur: string }[]
}

export default function Sidebar({ projets = [] }: SidebarProps) {
  const path = usePathname()

  return (
    <aside style={{ background: 'var(--brand)', minHeight: '100vh', width: 215 }}
      className="flex flex-col gap-1 px-3 py-5 flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-5 font-display text-white text-lg font-bold border-b border-white/10 mb-1">
        <div className="flex items-end gap-1">
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--orange)' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
        </div>
        StudioFlow
      </div>

      {/* Nav principale */}
      <p className="text-white/35 text-xs font-semibold tracking-widest uppercase px-2 pt-2 pb-1">Espace</p>
      {navMain.map(({ href, label, icon }) => (
        <Link key={href} href={href}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
            path.startsWith(href)
              ? 'bg-white/15 text-white font-medium'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          )}>
          <span className="text-base">{icon}</span> {label}
        </Link>
      ))}

      {/* Projets */}
      <p className="text-white/35 text-xs font-semibold tracking-widest uppercase px-2 pt-3 pb-1">Projets</p>
      {projets.map(p => (
        <Link key={p.id} href={`/projets/${p.id}`}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
            path === `/projets/${p.id}`
              ? 'bg-white/15 text-white font-medium'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          )}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.couleur, flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.3)' }} />
          <span className="truncate">{p.nom}</span>
        </Link>
      ))}
      <Link href="/projets/nouveau"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 transition-all">
        <span>＋</span> Nouveau projet
      </Link>

      {/* Nav bas */}
      <div className="mt-auto pt-3 border-t border-white/10 flex flex-col gap-1">
        {navBottom.map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <span>{icon}</span> {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
