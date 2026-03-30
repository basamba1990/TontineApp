# TontineApp V7 - Fintech Ultra Premium 🚀

Bienvenue dans la version 7 de **TontineApp**, une application fintech multi-pays et multi-devises conçue pour offrir une expérience utilisateur premium avec une interface moderne et des fonctionnalités avancées.

## ✨ Fonctionnalités V7

- 📱 **Expo & React Native** : Architecture moderne basée sur Expo Router.
- 💎 **UI Ultra Premium** : Effets Glassmorphism, animations fluides et retour haptique.
- 🌍 **Multi-Pays / Multi-Devises** : Support complet pour XOF, EUR, USD, CAD, GBP avec conversion intégrée.
- ⚡ **Realtime Supabase** : Mises à jour en temps réel des soldes et des transactions.
- 📊 **Victory Charts** : Visualisations de données animées pour suivre la performance financière.
- 🔐 **Sécurité Avancée** : Authentification Supabase, Edge Functions pour les opérations sensibles et stockage sécurisé.
- 🌙 **Dark Mode** : Support complet du mode sombre et clair.

## 🏗️ Structure du Projet

- `app/` : Navigation et pages (Dashboard, Wallets, Transactions, Profil, Dépôt, Retrait, Transfert).
- `components/` : Composants UI réutilisables (GlassCard, PremiumButton, Chart, etc.).
- `context/` : Gestion de l'état global (User, Wallet, Transaction).
- `hooks/` : Hooks personnalisés pour la logique métier.
- `lib/` : Utilitaires API, thèmes et gestion des devises.
- `supabase/` : Migrations SQL et Edge Functions.
- `types/` : Définitions TypeScript pour une robustesse maximale.

## 🚀 Lancement Rapide

1. **Installer les dépendances** :
   ```bash
   pnpm install
   ```

2. **Configurer les variables d'environnement** :
   Créez un fichier `.env` à la racine :
   ```env
   EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

3. **Lancer l'application** :
   ```bash
   npx expo start
   ```

## 🛠️ Configuration Supabase

- Appliquez les migrations situées dans `supabase/migrations/schema.sql` dans votre éditeur SQL Supabase.
- Déployez les Edge Functions situées dans `supabase/functions/`.

---
Développé avec ❤️ pour une expérience fintech sans compromis.
