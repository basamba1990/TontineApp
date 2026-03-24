# Mon-App MVP

Ce projet est un MVP (Minimum Viable Product) pour une application mobile de tontine, intégrant KYC, paiements via PayDunya (Wave/Orange Money), un système de Trust Score basé sur l'IA, et une UI de style fintech.

## Architecture

- **Frontend**: React Native (Expo)
- **Backend**: Supabase (Auth, PostgreSQL Database, Storage, Edge Functions)
- **Paiements**: PayDunya (intégration Wave/Orange Money)
- **IA**: OpenAI (pour le scoring prédictif de fraude)

## Fonctionnalités

### Mobile App (Expo React Native)
- **Authentification OTP**: Connexion sécurisée par numéro de téléphone.
- **KYC Upload + Selfie**: Vérification d'identité avec téléchargement de documents et selfie.
- **Dashboard UX Pro**: Affichage du Trust Score et liste des tontines.
- **Gestion des tontines**: Création de groupes, invitation de membres, détails du groupe, historique des contributions.
- **Paiement Wave/Orange via PayDunya**: Intégration des paiements mobiles.
- **Trust Score affiché**: Score de confiance de l'utilisateur visible.
- **Notifications**: Push notifications et notifications in-app.

### Supabase Backend
- **Auth**: Gestion des utilisateurs.
- **Tables**: `users`, `kyc`, `groups`, `group_members`, `contributions`, `payments`, `user_metrics`, `notifications`, `invitations`.
- **Storage**: Stockage sécurisé des images KYC.
- **Edge Functions**:
    - `calculate-trust-score`: Calcule et met à jour le score de confiance de l'utilisateur.
    - `predictive-fraud`: Utilise OpenAI pour détecter les comportements frauduleux.
    - `create-payment`: Initialise une transaction de paiement via PayDunya.
    - `webhook-confirmation`: Gère les retours de PayDunya pour confirmer les paiements et déclencher les notifications.
    - `send-push-notification`: Envoie des notifications push via Expo.

## Installation et Configuration

### 1. Prérequis
- Node.js (version 18 ou supérieure)
- Expo CLI (`npm install -g expo-cli`)
- Un compte Supabase
- Un compte PayDunya (avec les clés API)
- Une clé API OpenAI

### 2. Configuration Supabase

#### a. Création du projet et de la base de données
1. Créez un nouveau projet sur [Supabase](https://supabase.com/).
2. Exécutez le script SQL suivant dans l'éditeur SQL de Supabase pour créer les tables et les politiques RLS:
   ```sql
   -- Contenu de mon-app/supabase/migrations/20260324000000_init_schema.sql
   -- (Le contenu complet est dans le fichier)
   ```

#### b. Configuration du Storage
1. Dans Supabase, allez dans la section `Storage`.
2. Créez un nouveau bucket nommé `kyc-documents`.

#### c. Déploiement des Edge Functions
1. Assurez-vous d'avoir le CLI Supabase installé (`npm install -g supabase-cli`).
2. Connectez-vous à votre projet Supabase via le CLI:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
3. Déployez les fonctions Edge:
   ```bash
   supabase functions deploy create-payment --no-verify-jwt
   supabase functions deploy webhook-confirmation --no-verify-jwt
   supabase functions deploy calculate-trust-score --no-verify-jwt
   supabase functions deploy predictive-fraud --no-verify-jwt
   supabase functions deploy send-push-notification --no-verify-jwt
   ```

#### d. Variables d'environnement Supabase
Configurez les variables d'environnement suivantes dans votre projet Supabase (section `Edge Functions` -> `Environment Variables`):
- `SUPABASE_URL`: L'URL de votre projet Supabase (disponible dans les paramètres du projet).
- `SUPABASE_ANON_KEY`: La clé `anon` de votre projet Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: La clé `service_role` de votre projet Supabase (utilisée par les fonctions Edge, à garder secrète).
- `PAYDUNYA_MASTER_KEY`: Votre clé Master PayDunya.
- `PAYDUNYA_PRIVATE_KEY`: Votre clé Privée PayDunya.
- `WEBHOOK_URL`: L'URL de votre fonction `webhook-confirmation` (ex: `https://your-project-ref.supabase.co/functions/v1/webhook-confirmation`).
- `OPENAI_API_KEY`: Votre clé API OpenAI.

### 3. Configuration de l'application mobile

#### a. Installation des dépendances
Dans le dossier `mobile`:
```bash
npm install
expo install expo-notifications @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-safe-area-context react-native-screens
```

#### b. Variables d'environnement Expo
Créez un fichier `.env` à la racine du dossier `mobile` avec les variables suivantes:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

#### c. Lancement de l'application
Dans le dossier `mobile`:
```bash
npm start
```
Scannez le QR code avec l'application Expo Go sur votre téléphone.

## Utilisation

1. **Authentification**: Connectez-vous avec votre numéro de téléphone et un code OTP.
2. **KYC**: Soumettez vos documents d'identité et un selfie pour vérification.
3. **Dashboard**: Visualisez votre Trust Score et gérez vos tontines.
4. **Tontines**: Créez de nouvelles tontines, invitez des membres et suivez les contributions.
5. **Paiements**: Effectuez des contributions via PayDunya.

## Développement

- Le code est structuré pour faciliter l'ajout de nouvelles fonctionnalités.
- Les fonctions Edge de Supabase gèrent la logique métier côté serveur.
- L'intégration OpenAI permet un scoring de fraude prédictif.

## Auteur

Manus AI
