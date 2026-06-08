import { Statut } from '@/types'
import { statutLabel, statutColor } from '@/lib/utils'

export default function StatutBadge({ statut }: { statut: Statut }) {
  const { bg, text } = statutColor(statut)
  return (
    <span style={{ background: bg, color: text, padding: '2px 9px', borderRadius: 99, fontSize: 11.5, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {statut === 'en_cours' && <span>↻</span>}
      {statut === 'fait' && <span>✓</span>}
      {statut === 'publie' && <span>↗</span>}
      {statut === 'a_valider' && <span>◎</span>}
      {statutLabel(statut)}
    </span>
  )
}
