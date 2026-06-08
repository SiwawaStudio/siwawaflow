'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import StatutBadge from '@/components/ui/StatutBadge'
import TachePanel from '@/components/ui/TachePanel'
import { formatDate, formatPrix } from '@/lib/utils'
import { Tache, Statut } from '@/types'
import Link from 'next/link'

const STATUTS: { value: Statut | 'tous'; label: string }[] = [
  { value: 'tous', label: 'Toutes' },
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'a_valider', label: 'À valider' },
  { value: 'fait', label: 'Fait' },
  { value: 'publie', label: 'Publié' },
]

export default function TachesPage() {
  const [taches, setTaches] = useState<Tache[]>([])
  const [projets, setProjets] = useState<any[]>([])
  const [filtre, setFiltre] = useState<Statut | 'tous'>('tous')
  const [projetFiltre, setProjetFiltre] = useState<string>('tous')
  const [selected, setSelected] = useState<Tache | null>(null)
  const [openST, setOpenST] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('taches').select('*, sous_taches(*), documents(*), commentaires(*), projets(id, nom, couleur, categorie, tarif_horaire)').order('ordre'),
      supabase.from('projets').select('id, nom, couleur').eq('statut', 'en_cours')
    ]).then(([{ data: t }, { data: p }]) => {
      setTaches(t ?? [])
      setProjets(p ?? [])
      setLoading(false)
    })
  }, [])

  const tachesFiltrees = taches.filter(t => {
    if (filtre !== 'tous' && t.statut !== filtre) return false
    if (projetFiltre !== 'tous' && t.projet_id !== projetFiltre) return false
    return true
  })

  function toggleST(id: string) {
    setOpenST(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function toggleCheck(tache: Tache) {
    const supabase = createClient()
    const newStatut: Statut = tache.statut === 'fait' ? 'a_faire' : 'fait'
    await supabase.from('taches').update({ statut: newStatut }).eq('id', tache.id)
    setTaches(prev => prev.map(t => t.id === tache.id ? { ...t, statut: newStatut } : t))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar projets={projets} />
      <main style={{ flex: 1, padding: '1.75rem', minWidth: 0 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>Toutes les tâches</h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{tachesFiltrees.length} tâches</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/timeline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: '#333' }}>▤ Timeline</Link>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Ajouter</button>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 3, background: 'var(--cream-dark)', padding: 3, borderRadius: 8 }}>
            {STATUTS.map(s => (
              <button key={s.value} onClick={() => setFiltre(s.value)}
                style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, border: 'none', cursor: 'pointer', fontWeight: 500, background: filtre === s.value ? '#fff' : 'transparent', color: filtre === s.value ? 'var(--brand)' : '#666' }}>
                {s.label}
              </button>
            ))}
          </div>
          <select value={projetFiltre} onChange={e => setProjetFiltre(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--cream-dark)', fontSize: 12, background: '#fff', color: '#333', cursor: 'pointer' }}>
            <option value="tous">Tous les projets</option>
            {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Chargement...</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 75px 70px', padding: '9px 14px', background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)', fontSize: 10.5, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Tâche</span><span>Projet</span><span>Statut</span><span>Dates</span><span>Durée</span><span>Prix</span>
            </div>

            {tachesFiltrees.map((t, i) => {
              const estOuvert = openST.includes(t.id)
              const sousTerminees = (t.sous_taches ?? []).filter(s => s.statut === 'fait' || s.statut === 'publie').length
              const proj = t.projets as any
              return (
                <div key={t.id}>
                  <div onClick={() => setSelected(t)}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 75px 70px', padding: '11px 14px', borderBottom: '1px solid var(--cream-dark)', alignItems: 'center', fontSize: 13, cursor: 'pointer', background: selected?.id === t.id ? 'var(--cream)' : '#fff', transition: 'background 0.1s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div onClick={e => { e.stopPropagation(); toggleCheck(t) }}
                        style={{ width: 17, height: 17, borderRadius: 5, background: (t.statut === 'fait' || t.statut === 'publie') ? '#2d7a4f' : '#fff', border: `1.5px solid ${(t.statut === 'fait' || t.statut === 'publie') ? '#2d7a4f' : 'var(--cream-dark)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        {(t.statut === 'fait' || t.statut === 'publie') && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, textDecoration: (t.statut === 'fait' || t.statut === 'publie') ? 'line-through' : 'none', color: (t.statut === 'fait' || t.statut === 'publie') ? '#aaa' : '#333' }}>{t.nom}</div>
                        {(t.sous_taches ?? []).length > 0 && (
                          <div onClick={e => { e.stopPropagation(); toggleST(t.id) }}
                            style={{ fontSize: 11, color: '#aaa', marginTop: 1, cursor: 'pointer' }}>
                            {estOuvert ? '▲' : '▼'} {(t.sous_taches ?? []).length} sous-tâches · {sousTerminees} terminées
                          </div>
                        )}
                      </div>
                    </div>
                    <div><span style={{ background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{proj?.nom}</span></div>
                    <div><StatutBadge statut={t.statut} /></div>
                    <div style={{ fontSize: 12, color: '#888' }}>{formatDate(t.date_debut)}–{formatDate(t.date_fin)}</div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{t.heures_estimees}h</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{formatPrix(t.heures_estimees)}</div>
                  </div>

                  {estOuvert && (t.sous_taches ?? []).map(s => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 75px 70px', padding: '7px 14px 7px 38px', borderBottom: '1px solid var(--cream-dark)', alignItems: 'center', fontSize: 12, background: 'var(--cream)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: (s.statut === 'fait' || s.statut === 'publie') ? '#2d7a4f' : '#fff', border: `1.5px solid ${(s.statut === 'fait' || s.statut === 'publie') ? '#2d7a4f' : 'var(--cream-dark)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {(s.statut === 'fait' || s.statut === 'publie') && <span style={{ color: 'white', fontSize: 9 }}>✓</span>}
                        </div>
                        <span style={{ textDecoration: (s.statut === 'fait' || s.statut === 'publie') ? 'line-through' : 'none', color: (s.statut === 'fait' || s.statut === 'publie') ? '#aaa' : '#444' }}>{s.nom}</span>
                      </div>
                      <div></div>
                      <div><StatutBadge statut={s.statut} /></div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{formatDate(s.date_debut)}–{formatDate(s.date_fin)}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 500 }}>{s.heures_estimees}h</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>{formatPrix(s.heures_estimees)}</div>
                    </div>
                  ))}
                </div>
              )
            })}

            {tachesFiltrees.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: 14 }}>Aucune tâche pour ce filtre.</div>
            )}
          </div>
        )}
      </main>

      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 40 }} />
          <TachePanel tache={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}
