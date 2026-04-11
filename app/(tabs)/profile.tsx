import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useUser } from '../../context/UserContext';
import { useAppTheme } from '../../lib/theme';
import GlassCard from '../../components/GlassCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { profile, signOut, refreshProfile } = useUser();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  const handleUpdateProfile = async (field: string, currentValue: string) => {
    Alert.prompt(
      `Modifier ${field}`,
      `Entrez votre nouveau ${field.toLowerCase()}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Enregistrer', 
          onPress: async (newValue) => {
            if (!newValue) return;
            try {
              const updateData: any = {};
              if (field === 'Nom Complet') updateData.full_name = newValue;
              if (field === 'Téléphone') updateData.phone_number = newValue;
              if (field === 'Pays') updateData.country_code = newValue;
              if (field === 'Devise Principale') updateData.preferred_currency = newValue;

              const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', profile?.id);
              
              if (error) throw error;
              Alert.alert('Succès', 'Profil mis à jour');
              refreshProfile();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ],
      'plain-text',
      currentValue
    );
  };

  const handleImageUpload = () => {
    Alert.alert('Upload Image', 'Cette fonctionnalité nécessite l\'intégration de expo-image-picker.');
  };

  const ProfileItem = ({ icon, label, value, onPress, color }: any) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.itemIcon, { backgroundColor: (color || colors.primary) + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color || colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.itemValue, { color: colors.text }]}>{value}</Text>
      </View>
      {onPress && <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Mon Profil</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                {profile?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}
            onPress={handleImageUpload}
          >
            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{profile?.full_name || 'Utilisateur'}</Text>
        <Text style={[styles.userEmail, { color: colors.muted }]}>{profile?.email}</Text>
        <View style={[styles.kycBadge, { backgroundColor: colors.success + '15' }]}>
          <MaterialCommunityIcons name="check-decagram" size={14} color={colors.success} />
          <Text style={[styles.kycText, { color: colors.success }]}>Vérifié</Text>
        </View>
      </View>

      <GlassCard style={styles.section}>
        <ProfileItem icon="account-outline" label="Nom Complet" value={profile?.full_name} onPress={() => handleUpdateProfile('Nom Complet', profile?.full_name || '')} />
        <ProfileItem icon="phone-outline" label="Téléphone" value={profile?.phone_number || 'Non renseigné'} onPress={() => handleUpdateProfile('Téléphone', profile?.phone_number || '')} />
        <ProfileItem icon="earth" label="Pays" value={profile?.country_code || 'Sénégal'} onPress={() => handleUpdateProfile('Pays', profile?.country_code || 'SN')} />
        <ProfileItem icon="cash" label="Devise Principale" value={profile?.preferred_currency || 'XOF'} onPress={() => handleUpdateProfile('Devise Principale', profile?.preferred_currency || 'XOF')} />
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>Paramètres</Text>
      <GlassCard style={styles.section}>
        <View style={[styles.item, { borderBottomColor: colors.border }]}>
          <View style={[styles.itemIcon, { backgroundColor: colors.primary + '15' }]}>
            <MaterialCommunityIcons name="theme-light-dark" size={22} color={colors.primary} />
          </View>
          <View style={styles.itemContent}>
            <Text style={[styles.itemValue, { color: colors.text }]}>Mode Sombre</Text>
          </View>
          <Switch value={isDark} onValueChange={() => {}} trackColor={{ true: colors.primary }} />
        </View>
        <ProfileItem icon="shield-lock-outline" label="Sécurité" value="PIN & Biométrie" onPress={() => Alert.alert('Sécurité', 'Paramètres de sécurité bientôt disponibles')} />
        <ProfileItem icon="bell-outline" label="Notifications" value="Activées" onPress={() => Alert.alert('Notifications', 'Paramètres de notifications bientôt disponibles')} />
      </GlassCard>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.muted }]}>TontineApp V7.0.0 (Premium)</Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kycText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    padding: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
  },
});
