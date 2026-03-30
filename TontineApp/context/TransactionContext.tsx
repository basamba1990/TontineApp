import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/api';
import { Transaction } from '../types';
import { useUser } from './UserContext';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshTransactions: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      setTransactions(data || []);
    } catch (err: any) {
      console.error('Error fetching transactions:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  useEffect(() => {
    if (profile) {
      fetchTransactions();
      
      // Subscribe to real-time transaction updates
      const subscription = supabase
        .channel(`transactions-user-${profile.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${profile.id}`,
        }, (payload) => {
          addTransaction(payload.new as Transaction);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [profile]);

  return (
    <TransactionContext.Provider value={{ transactions, loading, error, refreshTransactions: fetchTransactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
