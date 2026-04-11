import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../lib/api';
import { useAppTheme } from '../lib/theme';
import PremiumButton from '../components/PremiumButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        Alert.alert('Succès', 'Vérifiez votre email pour confirmer votre compte');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="wallet" size={48} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Tontine Collateral</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isSignUp ? 'Créez votre compte fintech premium' : 'Bienvenue dans votre espace financier'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={[styles.inputGroup, { backgroundColor: colors.accent }]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nom Complet"
                placeholderTextColor={colors.muted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={[styles.inputGroup, { backgroundColor: colors.accent }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.accent }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Mot de passe"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isSignUp && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}

          <PremiumButton
            title={loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
            onPress={handleAuth}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity style={styles.switchBtn} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.switchText, { color: colors.muted }]}>
              {isSignUp ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                {isSignUp ? 'Se connecter' : "S'inscrire"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 30,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderRadius: 18,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    height: 60,
    marginBottom: 24,
  },
  switchBtn: {
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
});
