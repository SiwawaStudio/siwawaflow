export type Statut = 'a_faire' | 'en_cours' | 'fait' | 'a_valider' | 'publie'
export type StatutProjet = 'en_cours' | 'termine' | 'en_pause' | 'archive'
export type TypeDocument = 'pdf' | 'lien' | 'audio' | 'image' | 'autre'
export type AuteurType = 'designer' | 'client'

export interface Client {
  id: string
  created_at: string
  nom: string
  email: string
  entreprise?: string
  couleur: string
  actif: boolean
}

export interface Projet {
  id: string
  created_at: string
  nom: string
  description?: string
  client_id: string
  couleur: string
  categorie?: string
  statut: StatutProjet
  date_debut?: string
  date_fin?: string
  heures_abonnement: number
  tarif_horaire: number
  clients?: Client
}

export interface ProjetStats extends Projet {
  client_nom: string
  client_email: string
  total_taches: number
  taches_terminees: number
  heures_totales: number
  montant_total: number
  progression: number
}

export interface Tache {
  id: string
  created_at: string
  projet_id: string
  nom: string
  objectif?: string
  statut: Statut
  couleur?: string
  date_debut?: string
  date_fin?: string
  heures_estimees: number
  ordre: number
  sous_taches?: SousTache[]
  documents?: Document[]
  commentaires?: Commentaire[]
  projets?: Projet
}

export interface SousTache {
  id: string
  created_at: string
  tache_id: string
  nom: string
  statut: Statut
  date_debut?: string
  date_fin?: string
  heures_estimees: number
  ordre: number
}

export interface Document {
  id: string
  created_at: string
  tache_id: string
  nom: string
  type: TypeDocument
  url: string
}

export interface Commentaire {
  id: string
  created_at: string
  tache_id: string
  auteur_type: AuteurType
  auteur_nom: string
  contenu: string
}
