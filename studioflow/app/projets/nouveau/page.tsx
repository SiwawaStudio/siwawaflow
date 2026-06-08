'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import { Client } from '@/types'
import Link from 'next/link'

const COULEURS = ['#5C0029', '#E77728', '#8a1040', '#1D9E75', '#185FA5', '#854F0B', '#2C2C2A']
const CATEGORIES = ['E-commerce', 'Branding', 'Social media', 'Web design', 'Print', 'Motion', 'Photo', 'Autre']

export default function NouveauProjetPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    description: '',
    client_id: '',
    couleur: '#5C0029',
    categorie: '',
    date_debut: '',
    date_fin: '',
    heures_abonnement: '10',
    tarif_horaire: '50',
  })

  useEffect(() => {
    createClient().from('clients').select('*').eq('actif', true).then(({ data }) => setClients(data ?? []))
  }, [])

  function set(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submit() {
    if (!form.nom || !form.client_id) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('projets').insert({
      nom: form.nom,
      description: form.description || null,
      client_id: form.client_id,
      couleur: form.couleur,
      categorie: form.categorie || null,
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
      heures_abonnement: parseInt(form.heures_abonnement),
      tarif_horaire: parseFloat(form.tarif_horaire),
      statut: 'en_cours',
    })
    if (!error) router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.75rem', minWidth: 0 }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Retour</Link>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>Nouveau projet</h1>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Nom du projet *</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)}
                placeholder="Refonte Boutique Alma"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Présentation rapide du projet..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff', resize: 'none', minHeight: 80 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Client *</label>
                <select value={form.client_id} onChange={e => set('client_id', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }}>
                  <option value="">Sélectionner...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.entreprise ? `— ${c.entreprise}` : ''}</option>)}
                </select>
                <Link href="/clients/nouveau" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>+ Nouveau client</Link>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Catégorie</label>
                <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }}>
                  <option value="">Sélectionner...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Date de début</label>
                <input type="date" value={form.date_debut} onChange={e => set('date_debut', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Deadline</label>
                <input type="date" value={form.date_fin} onChange={e => set('date_fin', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Heures abonnement</label>
                <input type="number" value={form.heures_abonnement} onChange={e => set('heures_abonnement', e.target.value)}
                  min="1" max="100"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Tarif horaire (€)</label>
                <input type="number" value={form.tarif_horaire} onChange={e => set('tarif_horaire', e.target.value)}
                  min="1"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Couleur du projet</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {COULEURS.map(c => (
                  <div key={c} onClick={() => set('couleur', c)}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer', border: form.couleur === c ? '3px solid #333' : '3px solid transparent', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#888' }}>
              💡 Montant total estimé : <strong style={{ color: 'var(--brand)' }}>{(parseInt(form.heures_abonnement || '0') * parseFloat(form.tarif_horaire || '0')).toLocaleString('fr-FR')}€</strong> ({form.heures_abonnement}h × {form.tarif_horaire}€)
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Link href="/dashboard"
                style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: '#555' }}>
                Annuler
              </Link>
              <button onClick={submit} disabled={loading || !form.nom || !form.client_id}
                style={{ flex: 2, padding: '10px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading || !form.nom || !form.client_id ? 0.6 : 1 }}>
                {loading ? 'Enregistrement...' : 'Créer le projet'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
