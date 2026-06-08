import { createClient } from '@/lib/supabase'
import { formatDate, formatPrix, statutLabel } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import StatutBadge from '@/components/ui/StatutBadge'
import ClientCommentaire from './ClientCommentaire'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface Props {
  params: { token: string }
}

async function getData(token: string) {
  const supabase = createClient()
  const { data: projet } = await supabase
    .from('projets')
    .select('*, clients(*)')
    .eq('id', token)
    .single()
  if (!projet) return null

  const { data: taches } = await supabase
    .from('taches')
    .select('*, sous_taches(*), documents(*), commentaires(*)')
    .eq('projet_id', token)
    .order('ordre')

  return { projet, taches: taches ?? [] }
}

export default async function ClientView({ params }: Props) {
  const data = await getData(params.token)
  if (!data) notFound()
  const { projet, taches } = data
  const client = projet.clients as any

  const terminees = taches.filter((t: any) => t.statut === 'fait' || t.statut === 'publie').length
  const progression = taches.length > 0 ? Math.round((terminees / taches.length) * 100) : 0
  const heuresTotal = taches.reduce((a: number, t: any) => a + Number(t.heures_estimees), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--brand)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--orange)' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'white' }}>StudioFlow</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Espace client</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{client?.nom}</div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Infos projet */}
        <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: projet.couleur, marginBottom: 4 }}>{projet.categorie}</div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>{projet.nom}</h1>
              {projet.description && <p style={{ fontSize: 14, color: '#888', marginTop: 6 }}>{projet.description}</p>}
            </div>
            <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '10px 16px', textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Abonnement</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand)' }}>{projet.heures_abonnement}h/mois</div>
              <div style={{ fontSize: 12, color: '#888' }}>{projet.tarif_horaire}€/h</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1rem' }}>
            <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Avancement</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand)' }}>{progression}%</div>
            </div>
            <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Tâches</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{terminees}/{taches.length}</div>
            </div>
            <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Heures utilisées</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{heuresTotal}h</div>
            </div>
          </div>
          <ProgressBar value={progression} color={projet.couleur} height={6} showLabel />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginTop: 5 }}>
            <span>Début : {formatDate(projet.date_debut)}</span>
            <span>Deadline : {formatDate(projet.date_fin)}</span>
          </div>
        </div>

        {/* Tâches */}
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--brand)', marginBottom: 10 }}>Tâches du projet</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {taches.map((t: any) => {
            const sousTerminees = (t.sous_taches ?? []).filter((s: any) => s.statut === 'fait' || s.statut === 'publie').length
            const prog = t.sous_taches?.length > 0 ? Math.round((sousTerminees / t.sous_taches.length) * 100) : (t.statut === 'fait' || t.statut === 'publie' ? 100 : 0)
            return (
              <div key={t.id} style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: t.statut === 'fait' || t.statut === 'publie' ? '#aaa' : '#333', textDecoration: t.statut === 'fait' || t.statut === 'publie' ? 'line-through' : 'none', marginBottom: 3 }}>{t.nom}</div>
                      {t.objectif && <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{t.objectif}</div>}
                    </div>
                    <StatutBadge statut={t.statut} />
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#aaa', marginBottom: 8 }}>
                    {t.date_debut && <span>📅 {formatDate(t.date_debut)} → {formatDate(t.date_fin)}</span>}
                    <span>⏱ {t.heures_estimees}h</span>
                    <span style={{ color: 'var(--brand)', fontWeight: 500 }}>{formatPrix(t.heures_estimees)}</span>
                  </div>

                  {t.sous_taches?.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#aaa' }}>Progression</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--brand)' }}>{prog}%</span>
                      </div>
                      <ProgressBar value={prog} height={4} />
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {t.sous_taches.map((s: any) => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                            <div style={{ width: 14, height: 14, borderRadius: 4, background: s.statut === 'fait' || s.statut === 'publie' ? '#2d7a4f' : '#fff', border: `1.5px solid ${s.statut === 'fait' || s.statut === 'publie' ? '#2d7a4f' : 'var(--cream-dark)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {(s.statut === 'fait' || s.statut === 'publie') && <span style={{ color: 'white', fontSize: 9 }}>✓</span>}
                            </div>
                            <span style={{ color: s.statut === 'fait' || s.statut === 'publie' ? '#aaa' : '#444', textDecoration: s.statut === 'fait' || s.statut === 'publie' ? 'line-through' : 'none' }}>{s.nom}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#bbb' }}>{s.heures_estimees}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {t.documents?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {t.documents.map((d: any) => (
                        <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', background: 'var(--cream)', borderRadius: 6, fontSize: 12, textDecoration: 'none', color: '#555' }}>
                          {d.type === 'pdf' ? '📄' : d.type === 'lien' ? '🔗' : d.type === 'audio' ? '🎙️' : '📎'} {d.nom}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commentaires client */}
                <ClientCommentaire tacheId={t.id} commentaires={t.commentaires ?? []} clientNom={client?.nom ?? 'Client'} />
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: '2rem' }}>
          Espace partagé en lecture seule · Propulsé par StudioFlow
        </p>
      </div>
    </div>
  )
}
