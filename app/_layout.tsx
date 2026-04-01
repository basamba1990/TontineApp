import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';
import { useAppTheme } from '../lib/theme';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

export default function RootLayout() {
  const { isDark } = useAppTheme();

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
