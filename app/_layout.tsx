import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';
import { useAppTheme } from '../lib/theme';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

// Empêche l'écran de démarrage de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark } = useAppTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simule un chargement ou effectue des initialisations ici
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Cache l'écran de démarrage une fois que l'application est prête
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <UserProvider>
      <WalletProvider>
        <TransactionProvider>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" options={{ gestureEnabled: false }} />
              <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
              <Stack.Screen name="deposit" options={{ presentation: 'modal' }} />
              <Stack.Screen name="withdraw" options={{ presentation: 'modal' }} />
              <Stack.Screen name="transfer" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </ThemeProvider>
        </TransactionProvider>
      </WalletProvider>
    </UserProvider>
  );
}
