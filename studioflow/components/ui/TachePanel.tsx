'use client'
import { useState } from 'react'
import { Tache, Commentaire } from '@/types'
import { formatDate, formatPrix, statutLabel } from '@/lib/utils'
import StatutBadge from './StatutBadge'
import ProgressBar from './ProgressBar'
import { createClient } from '@/lib/supabase'

interface TachePanelProps {
  tache: Tache
  onClose: () => void
  readOnly?: boolean
  clientNom?: string
}

const DOC_ICONS: Record<string, string> = { pdf: '📄', lien: '🔗', audio: '🎙️', image: '🖼️', autre: '📎' }

export default function TachePanel({ tache, onClose, readOnly = false, clientNom }: TachePanelProps) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>(tache.commentaires ?? [])
  const [contenu, setContenu] = useState('')
  const [auteurType, setAuteurType] = useState<'designer' | 'client'>('designer')
  const [sending, setSending] = useState(false)

  const sousTerminees = (tache.sous_taches ?? []).filter(s => s.statut === 'fait' || s.statut === 'publie').length
  const sousTotal = (tache.sous_taches ?? []).length
  const progPct = sousTotal > 0 ? Math.round((sousTerminees / sousTotal) * 100) : (tache.statut === 'fait' || tache.statut === 'publie' ? 100 : 0)

  async function envoyerCommentaire() {
    if (!contenu.trim()) return
    setSending(true)
    const supabase = createClient()
    const nom = auteurType === 'designer' ? 'Designer' : (clientNom ?? 'Client')
    const { data, error } = await supabase.from('commentaires').insert({
      tache_id: tache.id,
      auteur_type: auteurType,
      auteur_nom: nom,
      contenu: contenu.trim()
    }).select().single()
    if (!error && data) {
      setCommentaires(prev => [...prev, data])
      setContenu('')
    }
    setSending(false)
  }

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff', borderLeft: '1px solid var(--cream-dark)', zIndex: 50, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--cream-dark)', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
        <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{tache.projets?.nom} · {tache.projets?.categorie}</div>
        <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--brand)', marginBottom: 8, paddingRight: 28 }}>{tache.nom}</div>
        <StatutBadge statut={tache.statut} />
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Objectif */}
        {tache.objectif && (
          <div style={{ borderBottom: '1px solid var(--cream-dark)', paddingBottom: '1rem' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 5 }}>Objectif</p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#444' }}>{tache.objectif}</p>
          </div>
        )}

        {/* Dates & infos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid var(--cream-dark)', paddingBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 3 }}>Début</p>
            <p style={{ fontSize: 13 }}>{formatDate(tache.date_debut)}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 3 }}>Deadline</p>
            <p style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 500 }}>{formatDate(tache.date_fin)}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 3 }}>Durée estimée</p>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{tache.heures_estimees}h</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 3 }}>Prix facturé</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)' }}>{formatPrix(tache.heures_estimees)}</p>
          </div>
        </div>

        {/* Progression & sous-tâches */}
        {sousTotal > 0 && (
          <div style={{ borderBottom: '1px solid var(--cream-dark)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa' }}>Progression</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>{progPct}%</span>
            </div>
            <ProgressBar value={progPct} />
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tache.sous_taches?.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                    background: (s.statut === 'fait' || s.statut === 'publie') ? '#2d7a4f' : '#fff',
                    border: `1.5px solid ${(s.statut === 'fait' || s.statut === 'publie') ? '#2d7a4f' : 'var(--cream-dark)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {(s.statut === 'fait' || s.statut === 'publie') && <span style={{ color: 'white', fontSize: 9 }}>✓</span>}
                  </div>
                  <span style={{ textDecoration: (s.statut === 'fait' || s.statut === 'publie') ? 'line-through' : 'none', color: (s.statut === 'fait' || s.statut === 'publie') ? '#aaa' : '#333' }}>{s.nom}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa' }}>{s.heures_estimees}h</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {(tache.documents ?? []).length > 0 && (
          <div style={{ borderBottom: '1px solid var(--cream-dark)', paddingBottom: '1rem' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 8 }}>Documents</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tache.documents?.map(doc => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--cream)', borderRadius: 7, fontSize: 13, textDecoration: 'none', color: '#333' }}>
                  <span>{DOC_ICONS[doc.type] ?? '📎'}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nom}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Commentaires */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 10 }}>Commentaires</p>

          {commentaires.length === 0 && (
            <p style={{ fontSize: 13, color: '#bbb', marginBottom: 12 }}>Aucun commentaire pour l'instant.</p>
          )}

          {commentaires.map(c => (
            <div key={c.id} style={{ background: 'var(--cream)', borderRadius: 8, padding: '9px 11px', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.auteur_type === 'designer' ? 'var(--brand)' : 'var(--orange)', marginBottom: 3 }}>
                {c.auteur_type === 'designer' ? '✏️' : '👤'} {c.auteur_nom}
              </div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{c.contenu}</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>
                {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {!readOnly && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <button onClick={() => setAuteurType('designer')}
                  style={{ flex: 1, padding: '6px', fontSize: 12, background: auteurType === 'designer' ? 'var(--brand)' : 'var(--cream)', color: auteurType === 'designer' ? 'white' : '#666', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 500 }}>
                  ✏️ Designer
                </button>
                <button onClick={() => setAuteurType('client')}
                  style={{ flex: 1, padding: '6px', fontSize: 12, background: auteurType === 'client' ? 'var(--orange)' : 'var(--cream)', color: auteurType === 'client' ? 'white' : '#666', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 500 }}>
                  👤 Client
                </button>
              </div>
              <textarea
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                placeholder={auteurType === 'designer' ? 'Note du designer...' : 'Message du client...'}
                style={{ width: '100%', border: '1px solid var(--cream-dark)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', resize: 'none', minHeight: 70, background: '#fff' }}
              />
              <button onClick={envoyerCommentaire} disabled={sending || !contenu.trim()}
                style={{ width: '100%', marginTop: 8, padding: '9px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
                {sending ? 'Envoi...' : '↗ Envoyer'}
              </button>
            </>
          )}

          {readOnly && (
            <>
              <textarea
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                placeholder="Laisser un commentaire..."
                style={{ width: '100%', border: '1px solid var(--cream-dark)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', resize: 'none', minHeight: 70, background: '#fff', marginTop: 8 }}
              />
              <button onClick={envoyerCommentaire} disabled={sending || !contenu.trim()}
                style={{ width: '100%', marginTop: 8, padding: '9px', background: 'var(--orange)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
                {sending ? 'Envoi...' : '↗ Envoyer un commentaire'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
