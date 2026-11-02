import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Not authenticated');

  async function signIn() {
    try {
      setLoading(true);
      setStatus('Opening browser...');

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'app',
        path: 'explore',
      });

      const loginUrl = new URL(
        'http://localhost:5500/frontend/index.html'
      );

      loginUrl.searchParams.set('redirect_uri', redirectUri);

      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl.toString(),
        redirectUri
      );

      console.log('[AUTH] Result:', result);

      if (result.type === 'success') {
        setStatus('Firebase login successful');
        Alert.alert('Success', 'Authentication completed.');
      } else {
        setStatus(result.type);
      }

    } catch (error) {
      console.error(error);
      setStatus('Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    }}>
      <Text>{status}</Text>

      <Button
        title={loading ? 'Signing in...' : 'Continue with Google'}
        onPress={signIn}
        disabled={loading}
      />
    </View>
  );
}