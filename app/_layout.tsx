import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { UserProvider, useUser } from '../context/UserContext';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';
import { useAppTheme } from '../lib/theme';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function NavigationGuard() {
  const { profile, loading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(tabs)';
    if (!profile && inAuthGroup) {
      router.replace('/login');
    } else if (profile && !inAuthGroup && segments[0] !== 'deposit' && segments[0] !== 'withdraw' && segments[0] !== 'transfer') {
      router.replace('/(tabs)');
    }
  }, [profile, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="deposit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="withdraw" options={{ presentation: 'modal' }} />
      <Stack.Screen name="transfer" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { isDark } = useAppTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try { await new Promise(resolve => setTimeout(resolve, 2000)); }
      catch (e) { console.warn(e); }
      finally { setAppIsReady(true); }
    }
    prepare();
  }, []);

  useEffect(() => { if (appIsReady) SplashScreen.hideAsync(); }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <UserProvider>
      <WalletProvider>
        <TransactionProvider>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <NavigationGuard />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </ThemeProvider>
        </TransactionProvider>
      </WalletProvider>
    </UserProvider>
  );
}
