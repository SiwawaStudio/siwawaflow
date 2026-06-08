'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Commentaire } from '@/types'

interface Props {
  tacheId: string
  commentaires: Commentaire[]
  clientNom: string
}

export default function ClientCommentaire({ tacheId, commentaires: init, clientNom }: Props) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>(init)
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [open, setOpen] = useState(false)

  const total = commentaires.length

  async function envoyer() {
    if (!contenu.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('commentaires').insert({
      tache_id: tacheId,
      auteur_type: 'client',
      auteur_nom: clientNom,
      contenu: contenu.trim()
    }).select().single()
    if (!error && data) {
      setCommentaires(prev => [...prev, data])
      setContenu('')
    }
    setSending(false)
  }

  return (
    <div style={{ borderTop: '1px solid var(--cream-dark)', padding: '10px 1.25rem', background: 'var(--cream)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', fontSize: 12.5, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        💬 {total > 0 ? `${total} commentaire${total > 1 ? 's' : ''}` : 'Laisser un commentaire'} {open ? '▲' : '▼'}
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {commentaires.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.auteur_type === 'designer' ? 'var(--brand)' : 'var(--orange)', marginBottom: 2 }}>
                {c.auteur_type === 'designer' ? '✏️ Designer' : `👤 ${c.auteur_nom}`}
              </div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{c.contenu}</div>
              <div style={{ fontSize: 10.5, color: '#bbb', marginTop: 2 }}>
                {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            placeholder="Votre commentaire, question ou retour..."
            style={{ width: '100%', border: '1px solid var(--cream-dark)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', resize: 'none', minHeight: 65, background: '#fff', marginTop: 4 }}
          />
          <button onClick={envoyer} disabled={sending || !contenu.trim()}
            style={{ marginTop: 6, padding: '7px 16px', background: 'var(--orange)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
            {sending ? 'Envoi...' : '↗ Envoyer'}
          </button>
        </div>
      )}
    </div>
  )
}
