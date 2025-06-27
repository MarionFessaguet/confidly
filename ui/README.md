# iExec Memories - Gestionnaire de Souvenirs Protégés

## Description

Application de gestion de souvenirs personnels utilisant la technologie iExec pour protéger et chiffrer les données sensibles. Les utilisateurs peuvent créer, stocker et partager leurs souvenirs de manière sécurisée grâce à la confidentialité computing d'iExec.

## Fonctionnalités

- **Création de souvenirs protégés** : Stockage sécurisé avec chiffrement côté client
- **Partage sélectif** : Octroi d'accès contrôlé à d'autres utilisateurs
- **Génération de magazines** : Compilation automatique des souvenirs partagés
- **Support multimédia** : Gestion des photos et contenus enrichis
- **Interface wallet** : Connexion Web3 pour l'authentification décentralisée

## Installation

```bash
# Cloner le repository
git clone git@github.com:MarionFessaguet/confidly.git
cd confidly/ui

# Installer les dépendances
npm ci

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env.local avec vos clés API
```

## Scripts disponibles

### Développement

```bash
npm run dev
```

Lance le serveur de développement Vite avec rechargement automatique sur `http://localhost:5173`.

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI (shadcn/ui)
│   └── wallet/         # Composants de connexion wallet
├── hooks/              # Hooks React personnalisés
│   └── wallet/         # Hooks pour la gestion wallet
├── lib/                # Utilitaires et configuration
├── assets/             # Images et ressources statiques
├── pages/              # Pages de l'application
└── types/              # Définitions TypeScript
```


