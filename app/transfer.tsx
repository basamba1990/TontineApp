import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { useAppTheme } from '../lib/theme';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { callEdgeFunction } from '../lib/api';

export default function TransferScreen() {
  const { wallets, refreshWallets } = useWallet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    const wallet = wallets.find(w => w.id === selectedWallet);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (!receiverEmail) {
      Alert.alert('Erreur', 'Veuillez entrer l\'email du destinataire');
      return;
    }
    if (wallet && Number(amount) > wallet.balance) {
      Alert.alert('Erreur', 'Solde insuffisant');
      return;
    }

    setLoading(true);
    try {
      const result = await callEdgeFunction('transfer-money', {
        wallet_id: selectedWallet,
        amount: Number(amount),
        receiver_email: receiverEmail,
        currency: wallet?.currency || 'XOF',
      });

      if (result.success) {
        Alert.alert('Succès', 'Transfert effectué avec succès !');
        await refreshWallets();
        router.back();
      } else {
        throw new Error(result.error || 'Une erreur est survenue');
      }
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
        <Text style={[styles.title, { color: colors.text }]}>Transfert</Text>
      </View>

      <GlassCard style={styles.section}>
        <Text style={[styles.label, { color: colors.muted }]}>Email du destinataire</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.accent }]}>
          <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="destinataire@exemple.com"
            placeholderTextColor={colors.muted}
            value={receiverEmail}
            onChangeText={setReceiverEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </GlassCard>

      <GlassCard style={styles.section}>
        <Text style={[styles.label, { color: colors.muted }]}>Montant à envoyer</Text>
        <View style={styles.amountInputContainer}>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={[styles.currencySuffix, { color: colors.primary }]}>
            {wallets.find(w => w.id === selectedWallet)?.currency || 'XOF'}
          </Text>
        </View>
        <Text style={[styles.availableBalance, { color: colors.muted }]}>
          Disponible: {wallets.find(w => w.id === selectedWallet)?.balance.toLocaleString()} {wallets.find(w => w.id === selectedWallet)?.currency}
        </Text>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>Envoyer de quel Wallet ?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
        {wallets.map(w => (
          <TouchableOpacity 
            key={w.id} 
            style={[
              styles.walletItem, 
              { 
                backgroundColor: selectedWallet === w.id ? colors.primary : colors.accent,
                borderColor: selectedWallet === w.id ? colors.primary : colors.border
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
        <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.muted} />
        <Text style={[styles.infoText, { color: colors.muted }]}>
          Les transferts entre utilisateurs TontineApp sont gratuits et instantanés.
        </Text>
      </View>

      <PremiumButton 
        title={loading ? "Traitement..." : "Envoyer l'argent"} 
        onPress={handleTransfer} 
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
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
