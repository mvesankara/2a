# 2A – Acteurs de l'Avenir

Application web de gestion associative pour **2A – Acteurs de l'Avenir** (Libreville, Gabon) : site vitrine, adhésion en ligne, espace membre, gestion de projets, tâches et articles.

## Stack technique

- **Next.js 15** (App Router) + **TypeScript**
- **Prisma ORM** + **PostgreSQL** (via Docker Compose)
- **shadcn/ui** (Radix UI) + **Tailwind CSS**
- **Auth maison par JWT** (bcryptjs + jsonwebtoken, token en cookie + localStorage)
- **TanStack Query** pour le data fetching côté client

## Installation

1. **Prérequis** : Node.js et npm installés sur votre machine (voir [nvm](https://github.com/nvm-sh/nvm)).

2. **Installer les dépendances**
   ```sh
   npm install
   ```

3. **Configurer l'environnement**

   Copier `.env.example` en `.env` et renseigner les variables :
   ```
   DATABASE_URL="postgresql://user:password@localhost:5433/dbname"
   JWT_SECRET=change_this_to_a_long_random_secret_in_production
   JWT_EXPIRES_IN=7d
   ```

4. **Démarrer la base de données** (PostgreSQL via Docker)
   ```sh
   npm run db:up
   ```

5. **Appliquer les migrations Prisma**
   ```sh
   npm run db:migrate
   ```

6. **(Optionnel) Peupler la base avec des données de départ**
   ```sh
   npm run db:seed
   ```

### Usage

Démarrer le serveur de développement :

```sh
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

Autres commandes utiles :

```sh
npm run build       # build de production
npm run start       # démarre le build de production
npm run lint        # lint du projet
npm run db:studio   # ouvre Prisma Studio
npm run db:down     # arrête la base de données Docker
```

### Confirmation d'email

À l'inscription, le compte est créé avec le statut `pending` et doit être vérifié. En développement, les emails (vérification, réinitialisation de mot de passe) sont simplement loggés en console (`src/lib/email.ts`) ; un provider SMTP reste à configurer pour la production.

## Structure du projet

- **`app/`** : routes Next.js (App Router)
  - pages publiques : accueil, `/login`, `/devenir-membre`, `/projets`, réinitialisation de mot de passe, vérification d'email
  - `dashboard/` : espace membre protégé (profil, tâches, projets, articles, espace personnel)
  - `api/` : routes API (auth, profil, adhésion, projets, tâches, articles, notifications, stats, newsletter)
- **`src/components/`** : composants UI réutilisables (shadcn/ui, dashboard, projets, adhésion, auth…)
- **`src/hooks/`** : hooks React (auth, permissions, notifications…)
- **`src/lib/`** : client API, JWT, middleware d'auth API, client Prisma, utilitaire email
- **`prisma/`** : schéma, migrations et script de seed
- **`public/`** : assets statiques

## Rôles et permissions

Les rôles membres (`adherent`, `membre_bureau`, `sympathisant`, `administrateur`) sont définis par l'enum Prisma `UserRole` et repris côté frontend dans `src/types/roles.ts`. Le rôle `administrateur` a tous les droits ; les autorisations fines sur les projets (créateur, "Chef de projet", etc.) sont gérées au cas par cas dans les routes API concernées.
