import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useUser } from '../../context/UserContext';
import { useWallet } from '../../context/WalletContext';
import { useTransaction } from '../../context/TransactionContext';
import { useAppTheme } from '../../lib/theme';
import GlassCard from '../../components/GlassCard';
import Chart from '../../components/Chart';
import TransactionItem from '../../components/TransactionItem';
import PremiumButton from '../../components/PremiumButton';
import { formatCurrency } from '../../lib/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { profile } = useUser();
  const { wallets, loading: walletLoading, refreshWallets, chartData } = useWallet();
  const { transactions, loading: txLoading, refreshTransactions } = useTransaction();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshWallets(), refreshTransactions()]);
    setRefreshing(false);
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const mainCurrency = wallets[0]?.currency || 'XOF';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.muted }]}>Bonjour,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{profile?.full_name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: colors.accent }]} onPress={() => router.push('/profile')}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.mainCard}>
        <Text style={[styles.totalLabel, { color: colors.muted }]}>Solde Total Estimé</Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatCurrency(totalBalance, mainCurrency)}
        </Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/deposit')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Dépôt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/transfer')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Transfert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/withdraw')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error }]}>
              <MaterialCommunityIcons name="arrow-up" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Retrait</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
        <TouchableOpacity onPress={() => router.push('/wallet')}>
          <Text style={[styles.seeMore, { color: colors.primary }]}>Détails</Text>
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.chartCard}>
        <Chart data={chartData} />
      </GlassCard>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transactions Récentes</Text>
        <TouchableOpacity onPress={() => router.push('/transactions')}>
          <Text style={[styles.seeMore, { color: colors.primary }]}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {transactions.slice(0, 5).map(tx => (
          <TransactionItem key={tx.id} tx={tx} />
        ))}
        {transactions.length === 0 && !txLoading && (
          <Text style={[styles.emptyText, { color: colors.muted }]}>Aucune transaction récente</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    padding: 24,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    padding: 0,
    marginBottom: 24,
  },
  transactionsList: {
    marginBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
