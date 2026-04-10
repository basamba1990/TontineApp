import { Redirect } from 'expo-router';
import { useUser } from '../context/UserContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004d40" />
      </View>
    );
  }

  return profile ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
