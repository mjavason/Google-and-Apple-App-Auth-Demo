import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { googleLogin, BackendUser } from '../features/auth/google-sign-in';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<BackendUser | null>(null);

  async function handleGoogleLogin() {
    try {
      setLoading(true);

      const result = await googleLogin();

      if (result) {
        setUser(result);
      }
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ marginTop: 200 }}>
      <View style={{ padding: 24, gap: 16 }}>
        <Button
          title={loading ? 'Signing in...' : 'Login with Google'}
          onPress={handleGoogleLogin}
          disabled={loading}
        />

        {user && (
          <View style={{ gap: 8 }}>
            <Text>UID: {user.uid}</Text>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Photo: {user.photo}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
