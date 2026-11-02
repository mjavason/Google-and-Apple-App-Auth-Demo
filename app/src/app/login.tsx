import { API_URL, FRONTEND_AUTH_URL } from '@/common/constants/env.constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photo?: string | null;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  async function signIn() {
    try {
      setLoading(true);

      // Generate a unique state for this authentication attempt.
      const state = Crypto.randomUUID();

      // Prepare hosted login URL.
      const loginUrl = new URL(FRONTEND_AUTH_URL);
      loginUrl.searchParams.set('state', state);

      // Open authentication session.
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl.toString(),
        'app://auth',
      );

      if (result.type !== 'success') {
        throw new Error('Authentication was cancelled.');
      }

      // Read callback parameters.
      const callbackUrl = new URL(result.url);
      const code = callbackUrl.searchParams.get('code');
      const returnedState = callbackUrl.searchParams.get('state');

      if (!code || returnedState !== state) {
        throw new Error('Invalid authentication response.');
      }

      // Exchange one-time code for user details.
      const response = await fetch(`${API_URL}/auth/mobile/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed.');
      }

      setUser(data.user);

      Alert.alert('Success', `Welcome ${data.user.email ?? 'User'}`);
    } catch (error) {
      console.error('Sign-in error:', error);

      Alert.alert(
        'Authentication failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 16,
      }}
    >
      {user ? (
        <>
          <Text>Authenticated</Text>
          <Text>{user.name}</Text>
          <Text>{user.email}</Text>
          <Text>{user.uid}</Text>
        </>
      ) : (
        <Text>Not authenticated</Text>
      )}

      <Button
        title={loading ? 'Signing in...' : 'Continue with Google'}
        onPress={signIn}
        disabled={loading}
      />
    </View>
  );
}
