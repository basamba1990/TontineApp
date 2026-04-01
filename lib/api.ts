// lib/api.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Adapter pour Expo SecureStore (mobile uniquement)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Variables d’environnement Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Détecte si on est côté client (mobile ou navigateur)
const isClient = typeof window !== 'undefined';

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isClient ? (ExpoSecureStoreAdapter as any) : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Fonction pour appeler les Edge Functions Supabase
export const callEdgeFunction = async (functionName: string, body: any) => {
  let token: string | undefined;

  if (isClient) {
    // côté mobile / client
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });

  return response.json();
};
