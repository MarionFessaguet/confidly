# iExec Memories - Gestionnaire de Souvenirs Protégés

## Description

Application de gestion de souvenirs personnels utilisant la technologie iExec pour protéger et chiffrer les données sensibles. Les utilisateurs peuvent créer, stocker et partager leurs souvenirs de manière sécurisée grâce à la confidentialité computing d'iExec.

## Fonctionnalités

- **Création de souvenirs protégés** : Stockage sécurisé avec chiffrement côté client
- **Partage sélectif** : Octroi d'accès contrôlé à d'autres utilisateurs
- **Génération de magazines** : Compilation automatique des souvenirs partagés
- **Support multimédia** : Gestion des photos et contenus enrichis
- **Interface wallet** : Connexion Web3 pour l'authentification décentralisée

## Technologies utilisées

- **React** - Framework front-end avec hooks
- **TypeScript** - Superset typé de JavaScript
- **Vite** - Outil de build rapide et serveur de développement
- **iExec DataProtector SDK** - Protection et chiffrement des données
- **shadcn/ui** - Composants UI et système de design
- **Lucide React** - Icônes modernes
- **Tailwind CSS** - Framework CSS utilitaire
- **ESLint** - Linter pour la qualité du code
- **Prettier** - Formateur de code automatique

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

## Fonctionnalités principales

### 🔒 Protection des données

- Chiffrement côté client avec iExec DataProtector
- Stockage décentralisé et sécurisé
- Contrôle total sur vos données personnelles

### 🤝 Partage sélectif

- Attribution d'accès granulaire par utilisateur
- Révocation d'accès à tout moment
- Notifications de partage

### 📖 Génération de magazines

- Compilation automatique des souvenirs partagés
- Traitement confidentiel avec iExec computing
- Export en différents formats

### 🖼️ Gestion multimédia

- Support des images et photos
- Compression et optimisation automatique
- Métadonnées préservées

## Guide d'utilisation

### 1. Connexion wallet

- Connectez votre wallet Web3 (MetaMask, WalletConnect)
- Assurez-vous d'être sur le réseau Bellecour (iExec Sidechain)

### 2. Créer un souvenir

- Cliquez sur "Créer"
- Choisissez le type de souvenir (anniversaire, voyage, naissance, sortie)
- Ajoutez un titre et une description
- Optionnellement, joignez une photo
- Cliquez sur "Sauvegarder" pour protéger vos données

### 3. Partager un souvenir

- Accédez à l'onglet "Partager"
- Sélectionnez le souvenir à partager
- Entrez l'adresse wallet du destinataire
- Confirmez le partage

### 4. Créer un magazine

- Visualisez les souvenirs partagés avec vous
- Sélectionnez ceux à inclure dans le magazine
- Cliquez sur "Créer Magazine"
- Téléchargez le résultat une fois généré

## Intégration iExec

Cette application utilise plusieurs fonctionnalités d'iExec :

- **DataProtector** : Protection et chiffrement des données sensibles
- **Confidential Computing** : Traitement sécurisé pour la génération de magazines
- **Access Control** : Gestion fine des permissions d'accès
- **Web3 Infrastructure** : Stockage décentralisé et authentification

## Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

- 📧 **Email** : support@votre-domaine.com
- 💬 **Discord** : [Lien vers votre serveur Discord]
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-username/iexec-memories/issues)
- 📖 **Documentation** : [Wiki du projet](https://github.com/votre-username/iexec-memories/wiki)

## Liens utiles

- [iExec Documentation](https://docs.iex.ec/)
- [DataProtector SDK](https://protecteddata.docs.iex.ec/)

---

**Développé avec ❤️ et la technologie iExec pour un web plus privé et sécurisé.**
