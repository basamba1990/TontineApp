import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useTransaction } from '../../context/TransactionContext';
import { useAppTheme } from '../../lib/theme';
import TransactionItem from '../../components/TransactionItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

export default function TransactionsScreen() {
  const { transactions, loading, refreshTransactions } = useTransaction();
  const { colors } = useAppTheme();
  const { walletId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesWallet = walletId ? tx.wallet_id === walletId : true;
      const matchesSearch = tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tx.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' ? true : tx.type === activeFilter;
      
      return matchesWallet && matchesSearch && matchesFilter;
    });
  }, [transactions, walletId, searchQuery, activeFilter]);

  const FilterChip = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity 
      style={[
        styles.chip, 
        { backgroundColor: activeFilter === value ? colors.primary : colors.accent }
      ]}
      onPress={() => setActiveFilter(value)}
    >
      <Text style={[styles.chipText, { color: activeFilter === value ? '#fff' : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.accent }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          <TextInput
            placeholder="Rechercher..."
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterChip label="Tout" value="all" />
          <FilterChip label="Dépôts" value="deposit" />
          <FilterChip label="Retraits" value="withdraw" />
          <FilterChip label="Transferts" value="transfer" />
          <FilterChip label="Tontines" value="tontine_payment" />
        </ScrollView>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => <TransactionItem tx={item} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="history" size={64} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>Aucune transaction trouvée</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    marginVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
