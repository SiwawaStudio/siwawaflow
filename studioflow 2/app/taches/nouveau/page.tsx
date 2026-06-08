'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import { Projet } from '@/types'
import Link from 'next/link'

const STATUTS = [
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'a_valider', label: 'À valider' },
  { value: 'fait', label: 'Fait' },
  { value: 'publie', label: 'Publié' },
]

const DOC_TYPES = [
  { value: 'lien', label: '🔗 Lien' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'audio', label: '🎙️ Audio' },
  { value: 'image', label: '🖼️ Image' },
  { value: 'autre', label: '📎 Autre' },
]

export default function NouvelleTachePage() {
  const router = useRouter()
  const params = useSearchParams()
  const projetIdInit = params.get('projet') ?? ''

  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    objectif: '',
    projet_id: projetIdInit,
    statut: 'a_faire',
    date_debut: '',
    date_fin: '',
    heures_estimees: '2',
  })
  const [sousTaches, setSousTaches] = useState<{ nom: string; heures: string; statut: string }[]>([])
  const [docs, setDocs] = useState<{ nom: string; url: string; type: string }[]>([])

  useEffect(() => {
    createClient().from('projets').select('*, clients(nom)').eq('statut', 'en_cours').then(({ data }) => setProjets(data ?? []))
  }, [])

  function set(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  function addSousTache() { setSousTaches(prev => [...prev, { nom: '', heures: '0.5', statut: 'a_faire' }]) }
  function setST(i: number, k: string, v: string) { setSousTaches(prev => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s)) }
  function removeST(i: number) { setSousTaches(prev => prev.filter((_, idx) => idx !== i)) }

  function addDoc() { setDocs(prev => [...prev, { nom: '', url: '', type: 'lien' }]) }
  function setDoc(i: number, k: string, v: string) { setDocs(prev => prev.map((d, idx) => idx === i ? { ...d, [k]: v } : d)) }
  function removeDoc(i: number) { setDocs(prev => prev.filter((_, idx) => idx !== i)) }

  const prixEstime = (parseFloat(form.heures_estimees || '0') * 50).toLocaleString('fr-FR')

  async function submit() {
    if (!form.nom || !form.projet_id) return
    setLoading(true)
    const supabase = createClient()

    const { data: tache, error } = await supabase.from('taches').insert({
      nom: form.nom,
      objectif: form.objectif || null,
      projet_id: form.projet_id,
      statut: form.statut,
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
      heures_estimees: parseFloat(form.heures_estimees),
      ordre: 0,
    }).select().single()

    if (!error && tache) {
      if (sousTaches.length > 0) {
        await supabase.from('sous_taches').insert(
          sousTaches.filter(s => s.nom).map((s, i) => ({
            tache_id: tache.id,
            nom: s.nom,
            heures_estimees: parseFloat(s.heures),
            statut: s.statut,
            ordre: i,
          }))
        )
      }
      if (docs.length > 0) {
        await supabase.from('documents').insert(
          docs.filter(d => d.nom && d.url).map(d => ({
            tache_id: tache.id,
            nom: d.nom,
            url: d.url,
            type: d.type,
          }))
        )
      }
      router.push('/taches')
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar projets={projets} />
      <main style={{ flex: 1, padding: '1.75rem', minWidth: 0 }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
            <Link href="/taches" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Retour</Link>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>Nouvelle tâche</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Infos principales */}
            <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nom de la tâche *</label>
                <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Conception page d'accueil" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Objectif / Description</label>
                <textarea value={form.objectif} onChange={e => set('objectif', e.target.value)}
                  placeholder="Décrire l'objectif de cette tâche, les livrables attendus..."
                  style={{ ...inputStyle, resize: 'none', minHeight: 90 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Projet *</label>
                  <select value={form.projet_id} onChange={e => set('projet_id', e.target.value)} style={inputStyle}>
                    <option value="">Sélectionner...</option>
                    {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Statut</label>
                  <select value={form.statut} onChange={e => set('statut', e.target.value)} style={inputStyle}>
                    {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates & heures */}
            <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>Dates & facturation</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date de début</label>
                  <input type="date" value={form.date_debut} onChange={e => set('date_debut', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Deadline</label>
                  <input type="date" value={form.date_fin} onChange={e => set('date_fin', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Durée estimée (heures)</label>
                <input type="number" value={form.heures_estimees} onChange={e => set('heures_estimees', e.target.value)}
                  min="0.5" step="0.5" style={{ ...inputStyle, maxWidth: 160 }} />
              </div>
              <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#888' }}>
                💡 Prix facturé estimé : <strong style={{ color: 'var(--brand)' }}>{prixEstime}€</strong> ({form.heures_estimees}h × 50€)
              </div>
            </div>

            {/* Sous-tâches */}
            <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>Sous-tâches</h2>
                <button onClick={addSousTache}
                  style={{ padding: '5px 12px', background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', fontWeight: 500 }}>
                  + Ajouter
                </button>
              </div>
              {sousTaches.length === 0 && <p style={{ fontSize: 13, color: '#bbb' }}>Aucune sous-tâche pour l'instant.</p>}
              {sousTaches.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 110px 30px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={s.nom} onChange={e => setST(i, 'nom', e.target.value)} placeholder="Nom de la sous-tâche"
                    style={{ ...inputStyle, fontSize: 13 }} />
                  <input type="number" value={s.heures} onChange={e => setST(i, 'heures', e.target.value)} min="0.5" step="0.5"
                    style={{ ...inputStyle, fontSize: 13 }} />
                  <select value={s.statut} onChange={e => setST(i, 'statut', e.target.value)}
                    style={{ ...inputStyle, fontSize: 12 }}>
                    {STATUTS.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                  <button onClick={() => removeST(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ccc' }}>✕</button>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>Documents liés</h2>
                <button onClick={addDoc}
                  style={{ padding: '5px 12px', background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', fontWeight: 500 }}>
                  + Ajouter
                </button>
              </div>
              {docs.length === 0 && <p style={{ fontSize: 13, color: '#bbb' }}>Aucun document lié (Figma, PDF, note vocale...)</p>}
              {docs.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 30px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select value={d.type} onChange={e => setDoc(i, 'type', e.target.value)} style={{ ...inputStyle, fontSize: 12 }}>
                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input value={d.nom} onChange={e => setDoc(i, 'nom', e.target.value)} placeholder="Nom du document"
                    style={{ ...inputStyle, fontSize: 13 }} />
                  <input value={d.url} onChange={e => setDoc(i, 'url', e.target.value)} placeholder="https://..."
                    style={{ ...inputStyle, fontSize: 13 }} />
                  <button onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ccc' }}>✕</button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/taches"
                style={{ flex: 1, padding: '11px', textAlign: 'center', background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: '#555' }}>
                Annuler
              </Link>
              <button onClick={submit} disabled={loading || !form.nom || !form.projet_id}
                style={{ flex: 2, padding: '11px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading || !form.nom || !form.projet_id ? 0.6 : 1 }}>
                {loading ? 'Enregistrement...' : 'Créer la tâche'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
