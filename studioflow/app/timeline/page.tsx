'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import TachePanel from '@/components/ui/TachePanel'
import { Tache } from '@/types'
import { addDays, startOfWeek, format, differenceInDays, parseISO, isSameDay, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function TimelinePage() {
  const [taches, setTaches] = useState<Tache[]>([])
  const [projets, setProjets] = useState<any[]>([])
  const [selected, setSelected] = useState<Tache | null>(null)
  const [loading, setLoading] = useState(true)
  const today = new Date()

  const rangeStart = startOfMonth(today)
  const rangeEnd = endOfMonth(addDays(today, 30))
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
  const totalDays = days.length

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('taches').select('*, sous_taches(*), documents(*), commentaires(*), projets(id, nom, couleur, categorie, tarif_horaire)').order('ordre'),
      supabase.from('projets').select('id, nom, couleur').eq('statut', 'en_cours')
    ]).then(([{ data: t }, { data: p }]) => {
      setTaches((t ?? []).filter((x: Tache) => x.date_debut && x.date_fin))
      setProjets(p ?? [])
      setLoading(false)
    })
  }, [])

  function barStyle(tache: Tache) {
    if (!tache.date_debut || !tache.date_fin) return null
    const start = parseISO(tache.date_debut)
    const end = parseISO(tache.date_fin)
    const offsetDays = differenceInDays(start, rangeStart)
    const durationDays = differenceInDays(end, start) + 1
    const left = (offsetDays / totalDays) * 100
    const width = (durationDays / totalDays) * 100
    if (left + width < 0 || left > 100) return null
    return {
      left: `${Math.max(0, left).toFixed(2)}%`,
      width: `${Math.min(width, 100 - Math.max(0, left)).toFixed(2)}%`,
    }
  }

  const weeks: { label: string; days: Date[] }[] = []
  let i = 0
  while (i < days.length) {
    const weekStart = startOfWeek(days[i], { weekStartsOn: 1 })
    const weekDays: Date[] = []
    for (let d = 0; d < 7 && i < days.length; d++, i++) weekDays.push(days[i])
    weeks.push({ label: `Sem. ${format(weekDays[0], 'w')} — ${format(weekDays[0], 'd MMM', { locale: fr })}`, days: weekDays })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar projets={projets} />
      <main style={{ flex: 1, padding: '1.75rem', minWidth: 0, overflow: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>Timeline</h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Semainier journalier · {format(rangeStart, 'MMMM yyyy', { locale: fr })}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Chargement...</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', borderRadius: 12, overflow: 'auto' }}>
            <div style={{ minWidth: 900 }}>

              {/* En-tête : noms de semaines */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--cream-dark)' }}>
                <div style={{ width: 180, flexShrink: 0, background: 'var(--cream)', padding: '8px 12px', fontSize: 10.5, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid var(--cream-dark)' }}>Tâche</div>
                <div style={{ flex: 1, display: 'flex', background: 'var(--cream)' }}>
                  {weeks.map((w, wi) => (
                    <div key={wi} style={{ flex: w.days.length, textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: '#888', padding: '8px 4px', borderRight: wi < weeks.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
                      {w.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* En-tête : jours */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--cream-dark)' }}>
                <div style={{ width: 180, flexShrink: 0, background: 'var(--cream)', borderRight: '1px solid var(--cream-dark)' }} />
                <div style={{ flex: 1, display: 'flex' }}>
                  {days.map((day, di) => {
                    const isToday = isSameDay(day, today)
                    const isWE = isWeekend(day)
                    return (
                      <div key={di} style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? 'var(--orange)' : isWE ? '#ccc' : '#aaa',
                        padding: '4px 0',
                        background: isToday ? 'var(--orange-light)' : isWE ? 'rgba(244,238,225,0.6)' : 'var(--cream)',
                        borderRight: di < days.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                        minWidth: 20,
                      }}>
                        <div>{format(day, 'EEEEE', { locale: fr })}</div>
                        <div>{format(day, 'd')}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lignes de tâches */}
              {taches.map((t, ti) => {
                const bar = barStyle(t)
                const proj = t.projets as any
                const isTerminee = t.statut === 'fait' || t.statut === 'publie'
                const todayOffset = differenceInDays(today, rangeStart)
                const todayPct = ((todayOffset + 0.5) / totalDays * 100).toFixed(2)

                return (
                  <div key={t.id} style={{ display: 'flex', borderBottom: '1px solid var(--cream-dark)', minHeight: 40 }}>
                    {/* Label tâche */}
                    <div style={{ width: 180, flexShrink: 0, padding: '8px 12px', fontSize: 12.5, fontWeight: 500, borderRight: '1px solid var(--cream-dark)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                      onClick={() => setSelected(t)}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: proj?.couleur ?? 'var(--brand)', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isTerminee ? '#aaa' : '#333', textDecoration: isTerminee ? 'line-through' : 'none' }}>{t.nom}</div>
                        <div style={{ fontSize: 10.5, color: '#bbb' }}>{t.heures_estimees}h</div>
                      </div>
                    </div>

                    {/* Zone grille + barre */}
                    <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                      {days.map((day, di) => {
                        const isWE = isWeekend(day)
                        const isToday = isSameDay(day, today)
                        return (
                          <div key={di} style={{
                            flex: 1,
                            background: isToday ? 'rgba(231,119,40,0.06)' : isWE ? 'rgba(244,238,225,0.5)' : 'transparent',
                            borderRight: di < days.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                            minWidth: 20,
                          }} />
                        )
                      })}

                      {/* Ligne aujourd'hui */}
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${todayPct}%`, width: 1.5, background: 'var(--orange)', zIndex: 4, pointerEvents: 'none' }} />

                      {/* Barre de tâche */}
                      {bar && (
                        <div onClick={() => setSelected(t)}
                          style={{
                            position: 'absolute', top: 8, height: 24, left: bar.left, width: bar.width,
                            background: proj?.couleur ?? 'var(--brand)',
                            borderRadius: 5, display: 'flex', alignItems: 'center', padding: '0 8px',
                            fontSize: 10.5, fontWeight: 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden',
                            opacity: isTerminee ? 0.55 : 1, cursor: 'pointer', zIndex: 3,
                          }}>
                          {t.nom}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {taches.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: 14 }}>
                  Aucune tâche avec des dates définies.
                </div>
              )}
            </div>

            {/* Légende */}
            <div style={{ display: 'flex', gap: 16, padding: '10px 14px', borderTop: '1px solid var(--cream-dark)', flexWrap: 'wrap', fontSize: 11.5, color: '#888', alignItems: 'center' }}>
              {projets.map(p => (
                <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: p.couleur, display: 'inline-block' }} />
                  {p.nom}
                </span>
              ))}
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 2, background: 'var(--orange)', display: 'inline-block' }} /> Aujourd'hui
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: 'rgba(244,238,225,0.8)', border: '1px solid var(--cream-dark)', borderRadius: 2, display: 'inline-block' }} /> Week-end
              </span>
            </div>
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
