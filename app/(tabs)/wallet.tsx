import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList, Alert } from 'react-native';
import { supabase } from '../../lib/api';
import { useWallet } from '../../context/WalletContext';
import { useAppTheme } from '../../lib/theme';
import WalletCard from '../../components/WalletCard';
import PremiumButton from '../../components/PremiumButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
  const { wallets, loading, refreshWallets } = useWallet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleCreateWallet = () => {
    Alert.alert(
      'Créer un Wallet',
      'Voulez-vous créer un nouveau portefeuille ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Créer', 
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase
                .from('wallets')
                .insert([
                  { 
                    user_id: user.id, 
                    currency: 'XOF', 
                    balance: 0,
                    country_code: 'SN'
                  }
                ]);

              if (error) throw error;
              Alert.alert('Succès', 'Wallet créé avec succès');
              refreshWallets();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWallets();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Mes Wallets</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={handleCreateWallet}>
          <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/transactions', params: { walletId: item.id } })}>
            <WalletCard wallet={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="wallet-outline" size={64} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>Aucun wallet trouvé</Text>
              <PremiumButton title="Créer un wallet" onPress={handleCreateWallet} style={styles.emptyBtn} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
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
    marginBottom: 24,
  },
  emptyBtn: {
    width: 200,
  },
});
