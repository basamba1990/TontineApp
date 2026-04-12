import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { useAppTheme } from '../lib/theme';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/api';

export default function WithdrawScreen() {
  const { wallets, refreshWallets } = useWallet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const wallet = wallets.find(w => w.id === selectedWallet);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (wallet && Number(amount) > wallet.balance) {
      Alert.alert('Erreur', 'Solde insuffisant');
      return;
    }

    setLoading(true);
    try {
      const withdrawAmount = Number(amount);
      
      // 1. Mettre à jour le solde du wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: (wallet?.balance || 0) - withdrawAmount })
        .eq('id', selectedWallet);

      if (walletError) throw walletError;

      // 2. Créer une transaction
      const { data: { user } } = await supabase.auth.getUser();
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user?.id,
          wallet_id: selectedWallet,
          amount: -withdrawAmount,
          currency: wallet?.currency || 'XOF',
          type: 'withdraw',
          status: 'completed',
          description: 'Retrait direct'
        }]);

      if (txError) throw txError;

      Alert.alert('Succès', 'Retrait effectué avec succès !');
      await refreshWallets();
      router.back();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.accent }]}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Retrait</Text>
      </View>

      <GlassCard style={styles.section}>
        <Text style={[styles.label, { color: colors.muted }]}>Montant à retirer</Text>
        <View style={styles.amountInputContainer}>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
          <Text style={[styles.currencySuffix, { color: colors.error }]}>
            {wallets.find(w => w.id === selectedWallet)?.currency || 'XOF'}
          </Text>
        </View>
        <Text style={[styles.availableBalance, { color: colors.muted }]}>
          Disponible: {wallets.find(w => w.id === selectedWallet)?.balance.toLocaleString()} {wallets.find(w => w.id === selectedWallet)?.currency}
        </Text>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>Retirer de quel Wallet ?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
        {wallets.map(w => (
          <TouchableOpacity 
            key={w.id} 
            style={[
              styles.walletItem, 
              { 
                backgroundColor: selectedWallet === w.id ? colors.error : colors.accent,
                borderColor: selectedWallet === w.id ? colors.error : colors.border
              }
            ]}
            onPress={() => setSelectedWallet(w.id)}
          >
            <Text style={[styles.walletCurrency, { color: selectedWallet === w.id ? '#fff' : colors.text }]}>{w.currency}</Text>
            <Text style={[styles.walletBalance, { color: selectedWallet === w.id ? '#fff' : colors.muted }]}>
              {w.balance.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.muted} />
        <Text style={[styles.infoText, { color: colors.muted }]}>
          Les retraits sont soumis à une vérification de sécurité et peuvent prendre jusqu'à 24h selon la méthode.
        </Text>
      </View>

      <PremiumButton 
        title={loading ? "Traitement..." : "Confirmer le Retrait"} 
        onPress={handleWithdraw} 
        variant="error"
        loading={loading}
        style={styles.submitBtn}
      />
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
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#EF4444',
    paddingBottom: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: 'bold',
  },
  currencySuffix: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  availableBalance: {
    fontSize: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  walletScroll: {
    marginBottom: 32,
  },
  walletItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  walletCurrency: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginBottom: 32,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
  },
});
