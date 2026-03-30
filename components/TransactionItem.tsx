import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../lib/theme';
import { Transaction } from '../types';
import { formatCurrency } from '../lib/currency';
import { formatDate, formatTime } from '../lib/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TransactionItemProps {
  tx: Transaction;
}

export default function TransactionItem({ tx }: TransactionItemProps) {
  const { colors } = useAppTheme();

  const getIcon = () => {
    switch (tx.type) {
      case 'deposit': return 'arrow-down-circle-outline';
      case 'withdraw': return 'arrow-up-circle-outline';
      case 'transfer': return 'swap-horizontal';
      case 'tontine_payment': return 'account-group-outline';
      case 'tontine_payout': return 'cash-multiple';
      default: return 'help-circle-outline';
    }
  };

  const getColor = () => {
    if (tx.status === 'failed' || tx.status === 'cancelled') return colors.error;
    if (tx.type === 'deposit' || tx.type === 'tontine_payout') return colors.success;
    return colors.text;
  };

  const getPrefix = () => {
    if (tx.type === 'deposit' || tx.type === 'tontine_payout') return '+';
    return '-';
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
        <MaterialCommunityIcons name={getIcon()} size={24} color={colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {tx.description || tx.type.replace('_', ' ')}
        </Text>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatDate(tx.created_at)} • {formatTime(tx.created_at)}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getColor() }]}>
          {getPrefix()}{formatCurrency(tx.amount, tx.currency)}
        </Text>
        <Text style={[styles.status, { color: colors.muted }]}>{tx.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
