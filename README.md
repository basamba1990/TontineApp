# TontineCollateral - Transformez l’épargne collective en garantie bancaire

## Structure du projet
- `/mobile` : App React Native (Expo)
- `/backend` : Migrations Supabase + Edge Functions
- `/ai-scoring` : API Python pour le scoring de crédit
- `/banking-portal` : Dashboard Next.js pour les banques partenaires

## Déploiement
1. Configurer Supabase (appliquer les migrations)
2. Déployer les Edge Functions
3. Lancer l’app mobile avec `cd mobile && npm start`
4. Lancer le scoring avec `cd ai-scoring && uvicorn main:app --reload`
5. Déployer le banking-portal sur Vercel

## Variables d’environnement
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MOMO_KEY` (clé API Wave/Orange)
