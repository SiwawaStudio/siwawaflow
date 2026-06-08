# StudioFlow — Guide de déploiement

## Structure du projet

```
studioflow/
├── app/
│   ├── dashboard/page.tsx       → Tableau de bord
│   ├── taches/page.tsx          → Liste des tâches
│   ├── timeline/page.tsx        → Gantt semainier
│   ├── client/[token]/page.tsx  → Vue client (lecture seule)
│   ├── layout.tsx
│   ├── page.tsx                 → Redirige vers /dashboard
│   └── globals.css
├── components/
│   ├── layout/Sidebar.tsx
│   └── ui/
│       ├── StatutBadge.tsx
│       ├── ProgressBar.tsx
│       └── TachePanel.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── types/index.ts
├── .env.local                   → À remplir avec tes clés Supabase
└── README.md
```

---

## Étape 1 — Remplir .env.local

Dans ton projet Supabase → Settings → API :

```
NEXT_PUBLIC_SUPABASE_URL=https://apsoftcjklwqmzgvfztn.supabase.co/rest/v1/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwc29mdGNqa2x3cW16Z3ZmenRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4ODA5MjAsImV4cCI6MjA5NjQ1NjkyMH0.eVmrqVqZMAcH-Mr6yicF-ZPXPKjN8QDVV72eHn7Gdl4
CLIENT_SHARE_SECRET=une-chaine-aleatoire-longue
```

---

## Étape 2 — Tester en local

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

---

## Étape 3 — Déployer sur Vercel

1. Push le projet sur GitHub :
```bash
git init
git add .
git commit -m "init studioflow"
git remote add origin https://github.com/TON-USER/studioflow.git
git push -u origin main
```

2. Sur vercel.com → "New Project" → importer le repo GitHub
3. Ajouter les variables d'environnement (même contenu que .env.local)
4. Cliquer "Deploy" → ton app est en ligne !

---

## Étape 4 — Connecter ton domaine OVH

Dans Vercel → Settings → Domains → ajouter tondomaine.fr

Dans OVH → Zone DNS → ajouter :
- Type : CNAME
- Sous-domaine : @ (ou www)
- Cible : cname.vercel-dns.com.

Attendre 10-30 min → HTTPS automatique activé.

---

## Partager un projet à un client

L'URL de vue client est :
```
https://tondomaine.fr/client/[ID_DU_PROJET]
```

L'ID du projet se trouve dans Supabase → Table projets → colonne id.

Le client peut :
- Voir toutes les tâches, sous-tâches, progression, documents
- Laisser des commentaires
- Ne peut PAS modifier quoi que ce soit

---

## Ajouter des données

Dans Supabase → Table Editor, tu peux ajouter directement :
- Des clients
- Des projets (lié à un client)
- Des tâches (liées à un projet)
- Des sous-tâches (liées à une tâche)
- Des documents (URL Figma, PDF hébergé, lien audio)
- Des commentaires
