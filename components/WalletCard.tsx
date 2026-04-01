import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import GlassCard from './GlassCard';
import { useAppTheme } from '../lib/theme';
import { Wallet } from '../types';
import { formatCurrency } from '../lib/currency';

interface WalletCardProps {
  wallet: Wallet;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const { colors } = useAppTheme();

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.currencyIcon}>
          <Text style={styles.currencySymbol}>{wallet.currency.substring(0, 1)}</Text>
        </View>
        <View>
          <Text style={[styles.currencyName, { color: colors.muted }]}>{wallet.currency} Wallet</Text>
          <Text style={[styles.countryCode, { color: colors.muted }]}>{wallet.country_code}</Text>
        </View>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={[styles.balance, { color: colors.text }]}>
          {formatCurrency(wallet.balance, wallet.currency)}
        </Text>
        <View style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.tagText, { color: colors.success }]}>Active</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  currencyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  countryCode: {
    fontSize: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
