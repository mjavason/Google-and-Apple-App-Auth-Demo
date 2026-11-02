
import { API_URL, FRONTEND_AUTH_URL } from '@/common/constants/env.constants';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photo?: string | null;
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  async function signIn() {
    if (loading) return;

    try {
      setLoading(true);

      const state = Crypto.randomUUID();

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'app',
        path: 'explore',
      });

      const loginUrl = new URL(FRONTEND_AUTH_URL);

      loginUrl.searchParams.set('state', state);
      loginUrl.searchParams.set('redirect_uri', redirectUri);

      console.log('[AUTH] Opening authentication session');

      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl.toString(),
        redirectUri,
      );

      console.log('[AUTH] Browser result:', result.type);

      if (result.type !== 'success') {
        return;
      }

      const callbackUrl = new URL(result.url);

      const code = callbackUrl.searchParams.get('code');
      const returnedState = callbackUrl.searchParams.get('state');

      if (!code || returnedState !== state) {
        throw new Error('Invalid authentication response.');
      }

      console.log('[AUTH] Callback validated');

      const response = await fetch(
        `${API_URL}/auth/mobile/redeem`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || 'Authentication failed.');
      }

      setUser(data.user);

      Alert.alert(
        'Success',
        `Welcome ${data.user.email ?? 'User'}`,
      );

    } catch (error) {
      console.error('[AUTH] Sign-in error:', error);

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
