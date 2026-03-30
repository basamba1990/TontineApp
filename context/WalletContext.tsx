import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/api';
import { Wallet, WalletBalanceHistory } from '../types';
import { useUser } from './UserContext';

interface WalletContextType {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  refreshWallets: () => Promise<void>;
  chartData: WalletBalanceHistory[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<WalletBalanceHistory[]>([]);

  const fetchWallets = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', profile.id)
        .order('currency', { ascending: true });

      if (walletError) throw walletError;
      setWallets(data || []);

      // Mock chart data generation for demonstration
      const mockChartData: WalletBalanceHistory[] = data?.map(w => ({
        date: new Date().toISOString(),
        balance: w.balance,
      })) || [];
      setChartData(mockChartData);
    } catch (err: any) {
      console.error('Error fetching wallets:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchWallets();
      
      // Subscribe to real-time wallet updates
      const subscription = supabase
        .channel(`wallets-user-${profile.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${profile.id}`,
        }, () => {
          fetchWallets();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [profile]);

  return (
    <WalletContext.Provider value={{ wallets, loading, error, refreshWallets: fetchWallets, chartData }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
