import { Statut } from '@/types'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date?: string) {
  if (!date) return '—'
  return format(parseISO(date), 'd MMM yyyy', { locale: fr })
}

export function formatDateShort(date?: string) {
  if (!date) return '—'
  return format(parseISO(date), 'd MMM', { locale: fr })
}

export function formatPrix(heures: number, tarif: number = 50) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(heures * tarif)
}

export function statutLabel(statut: Statut): string {
  const labels: Record<Statut, string> = {
    a_faire: 'À faire',
    en_cours: 'En cours',
    fait: 'Fait',
    a_valider: 'À valider',
    publie: 'Publié',
  }
  return labels[statut]
}

export function statutColor(statut: Statut) {
  const colors: Record<Statut, { bg: string; text: string }> = {
    a_faire: { bg: '#F4EEE1', text: '#666' },
    en_cours: { bg: '#fef3e8', text: '#a84f00' },
    fait: { bg: '#eaf3de', text: '#2d6611' },
    a_valider: { bg: '#fff3e0', text: '#9a4a00' },
    publie: { bg: '#f9eef3', text: '#5C0029' },
  }
  return colors[statut]
}

export function progression(terminees: number, total: number): number {
  if (total === 0) return 0
  return Math.round((terminees / total) * 100)
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
