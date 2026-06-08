'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import Link from 'next/link'

const COULEURS = ['#5C0029', '#E77728', '#8a1040', '#1D9E75', '#185FA5', '#854F0B', '#2C2C2A']

export default function NouveauClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    email: '',
    entreprise: '',
    couleur: '#5C0029',
  })

  function set(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submit() {
    if (!form.nom || !form.email) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('clients').insert({
      nom: form.nom,
      email: form.email,
      entreprise: form.entreprise || null,
      couleur: form.couleur,
    })
    if (!error) router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.75rem', minWidth: 0 }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Retour</Link>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>Nouveau client</h1>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Nom complet *</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)}
                placeholder="Sophie Martinet"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Email *</label>
              <input value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="sophie@boutique.fr" type="email"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Entreprise</label>
              <input value={form.entreprise} onChange={e => set('entreprise', e.target.value)}
                placeholder="Boutique Alma"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fff' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Couleur associée</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {COULEURS.map(c => (
                  <div key={c} onClick={() => set('couleur', c)}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer', border: form.couleur === c ? '3px solid #333' : '3px solid transparent', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Link href="/dashboard"
                style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: '#555' }}>
                Annuler
              </Link>
              <button onClick={submit} disabled={loading || !form.nom || !form.email}
                style={{ flex: 2, padding: '10px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading || !form.nom || !form.email ? 0.6 : 1 }}>
                {loading ? 'Enregistrement...' : 'Créer le client'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
