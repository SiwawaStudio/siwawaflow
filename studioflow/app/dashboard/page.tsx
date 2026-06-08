import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import ProgressBar from '@/components/ui/ProgressBar'
import StatutBadge from '@/components/ui/StatutBadge'
import { formatDate, formatPrix } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 0

async function getData() {
  const supabase = createClient()
  const [{ data: stats }, { data: projets }, { data: taches }] = await Promise.all([
    supabase.from('vue_projets_stats').select('*').order('created_at', { ascending: false }),
    supabase.from('projets').select('id, nom, couleur').eq('statut', 'en_cours'),
    supabase.from('taches').select('*, projets(nom, couleur, categorie)').order('created_at', { ascending: false }).limit(6)
  ])
  return { stats: stats ?? [], projets: projets ?? [], taches: taches ?? [] }
}

export default async function Dashboard() {
  const { stats, projets, taches } = await getData()

  const totalHeures = stats.reduce((a, p) => a + Number(p.heures_totales), 0)
  const totalMontant = stats.reduce((a, p) => a + Number(p.montant_total), 0)
  const totalTaches = stats.reduce((a, p) => a + Number(p.total_taches), 0)
  const totalTerminees = stats.reduce((a, p) => a + Number(p.taches_terminees), 0)
  const progressionGlobale = totalTaches > 0 ? Math.round((totalTerminees / totalTaches) * 100) : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar projets={projets} />
      <main style={{ flex: 1, padding: '1.75rem', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>Tableau de bord</h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{stats.length} projets actifs</p>
          </div>
          <Link href="/projets/nouveau"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--brand)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            + Nouveau projet
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { num: totalTaches, label: 'Tâches actives', sub: `${totalTerminees} terminées`, color: 'var(--brand)' },
            { num: `${totalHeures}h`, label: 'Heures facturées', sub: 'ce mois', color: '#333' },
            { num: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalMontant), label: 'Montant facturé', sub: `${totalHeures}h × 50€`, color: 'var(--orange)' },
            { num: `${progressionGlobale}%`, label: 'Avancement global', sub: null, color: 'var(--brand)' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1rem 1.1rem' }}>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{s.label}</div>
              {i === 3
                ? <ProgressBar value={progressionGlobale} height={4} />
                : <div style={{ fontSize: 11, color: '#bbb', marginTop: 5 }}>{s.sub}</div>
              }
            </div>
          ))}
        </div>

        {/* Projets */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand)' }}>Projets en cours</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.75rem' }}>
          {stats.map(p => (
            <Link key={p.id} href={`/projets/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.15s' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.couleur, borderRadius: '12px 12px 0 0' }} />
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: p.couleur, marginBottom: 3 }}>{p.categorie}</div>
                <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 2 }}>{p.nom}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>👤 {p.client_nom}</div>
                <ProgressBar value={Number(p.progression)} color={p.couleur} height={4} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#bbb', marginTop: 3, marginBottom: 8 }}>
                  <span>{p.progression}% terminé</span>
                  <span>→ {formatDate(p.date_fin)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#888' }}>
                    <span>☑ {p.taches_terminees}/{p.total_taches}</span>
                    <span>◷ {p.heures_totales}h</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>{formatPrix(Number(p.heures_totales))}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tâches récentes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand)' }}>Tâches récentes</h2>
          <Link href="/taches" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>Voir toutes →</Link>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 70px 70px', padding: '9px 14px', background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)', fontSize: 10.5, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Tâche</span><span>Projet</span><span>Statut</span><span>Dates</span><span>Durée</span><span>Prix</span>
          </div>
          {taches.map((t: any, i: number) => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 70px 70px', padding: '11px 14px', borderBottom: i < taches.length - 1 ? '1px solid var(--cream-dark)' : 'none', alignItems: 'center', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 17, height: 17, borderRadius: 5, background: (t.statut === 'fait' || t.statut === 'publie') ? '#2d7a4f' : '#fff', border: `1.5px solid ${(t.statut === 'fait' || t.statut === 'publie') ? '#2d7a4f' : 'var(--cream-dark)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(t.statut === 'fait' || t.statut === 'publie') && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontWeight: 500, textDecoration: (t.statut === 'fait' || t.statut === 'publie') ? 'line-through' : 'none', color: (t.statut === 'fait' || t.statut === 'publie') ? '#aaa' : '#333' }}>{t.nom}</span>
              </div>
              <div><span style={{ background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{t.projets?.nom}</span></div>
              <div><StatutBadge statut={t.statut} /></div>
              <div style={{ fontSize: 12, color: '#888' }}>{formatDate(t.date_debut)} – {formatDate(t.date_fin)}</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{t.heures_estimees}h</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{formatPrix(t.heures_estimees)}</div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
