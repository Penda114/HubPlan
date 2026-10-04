# HubPlan

Kanban minimaliste branché sur les issues GitHub d'un repo.

Les issues ouvertes sont réparties dans 4 colonnes (`Backlog`, `En cours`, `Review`, `Terminé`)
selon un label préfixé par `col:` (ex. `col:En cours`). Glisser-déposer une carte met à jour
ce label sur l'issue GitHub, sans toucher aux autres labels.

La page `/docs` affiche le `README.md` du repo configuré.

## Configuration

Copie `.env.example` en `.env` :

```
AUTH_SECRET=          # npx auth secret
AUTH_GITHUB_ID=       # GitHub OAuth App
AUTH_GITHUB_SECRET=
GITHUB_OWNER=         # ex. mon-org
GITHUB_REPO=          # ex. hub-plan
```

### GitHub OAuth App

- **Homepage URL** : l'URL de l'app (ex. `https://hub-plan.vercel.app`)
- **Authorization callback URL** : `<url>/api/auth/callback/github`

L'app demande le scope `read:user user:email repo`. Le scope `repo` est nécessaire pour lire
et écrire les issues du repo configuré (indispensable pour un repo privé et pour déplacer une
carte). Si le repo est public, `public_repo` suffit et est moins permissif.

## Développement

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:3000 et connecte-toi via GitHub.
