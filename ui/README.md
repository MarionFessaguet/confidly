# 🚀 React Web3 Template

Un template moderne et complet pour créer rapidement des applications Web3 avec React, TypeScript et une architecture modulaire.

## ✨ Fonctionnalités

### 🎨 Interface utilisateur
- **Sidebar & Navbar dynamiques** - Système d'onglets facilement configurable
- **Thème sombre/clair** - Basculement automatique avec persistence
- **Composants UI modulaires** - Boutons, cartes, inputs, etc. réutilisables
- **Design responsive** - Optimisé pour mobile et desktop

### 🔐 Intégration Web3
- **Connexion Wallet** - Support WalletConnect et connexions directes
- **Wagmi & Viem** - Intégration simplifiée avec les smart contracts
- **Multi-chaînes** - Support pour Ethereum, Polygon, BSC, etc.
- **Protection des routes** - Pages accessibles uniquement avec wallet connecté

### 🛠 Architecture flexible
- **Ajout/suppression d'onglets simplifiée** - Configuration centralisée
- **Structure modulaire** - Composants réutilisables et maintenables
- **TypeScript complet** - Type safety et meilleure DX
- **Hot reload** - Développement rapide avec Vite

### 🌐 Intégrations prêtes
- **The Graph** - Intégration subgraph pour les données blockchain
- **APIs REST** - Système de requêtes configuré
- **State management** - Context API pour l'état global
- **Routing** - Navigation SPA avec React Router

## 🚀 Démarrage rapide

1. **Installation**
   ```bash
   npm install
   ```

2. **Configuration**
   - Ajoutez vos clés API dans `.env`
   - Configurez les réseaux blockchain souhaités
   - Personnalisez les onglets dans la configuration

3. **Développement**
   ```bash
   npm run dev
   ```

## 📁 Structure du projet

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI de base
│   ├── wallet/          # Composants Web3
│   └── layout/          # Navigation et structure
├── pages/               # Pages de l'application
├── contexts/            # Contextes React (wallet, thème)
├── hooks/               # Hooks personnalisés
└── lib/                 # Utilitaires et configuration
```

## 🎯 Personnalisation

### Ajouter un nouvel onglet
1. Créez votre page dans `src/pages/`
2. Ajoutez la route dans la configuration
3. L'onglet apparaît automatiquement dans la navigation

### Modifier les composants
- Tous les composants sont dans `src/components/`
- Styles Tailwind CSS facilement personnalisables
- Architecture modulaire pour une maintenance simple

## 🔧 Technologies utilisées

- **React 18** + **TypeScript** - Framework principal
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utilitaire
- **Wagmi** - Hooks React pour Ethereum
- **WalletConnect** - Connexion wallet universelle
- **Radix UI** - Composants accessibles

## 📝 Prochaines étapes

Ce template fournit une base solide. Vous pouvez maintenant :
- Ajouter vos smart contracts
- Configurer vos subgraphs
- Personnaliser l'interface
- Déployer votre application

---

**Template conçu pour une customisation facile - Parfait pour débuter votre projet Web3 ! 🎉**
