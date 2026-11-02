import { API_URL, FRONTEND_AUTH_URL } from '@/common/constants/env.constants';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Button, Platform, Text, View } from 'react-native';

type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photo: string | null;
};

type RedeemResponse = {
  success: boolean;
  user?: AuthenticatedUser;
  status?: string;
  message?: string;
};

const POLL_INTERVAL = 1000;
const SESSION_TIMEOUT = 120_000;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  async function createSession(): Promise<string> {
    const response = await fetch(`${API_URL}/auth/mobile/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.sessionId) {
      throw new Error(data.message || 'Could not create auth session.');
    }

    return data.sessionId;
  }

  async function redeemSession(
    sessionId: string,
  ): Promise<AuthenticatedUser | null> {
    const response = await fetch(`${API_URL}/auth/mobile/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data: RedeemResponse = await response.json();

    if (response.status === 202) {
      return null;
    }

    if (!response.ok || !data.success || !data.user) {
      throw new Error(data.message || 'Could not retrieve authenticated user.');
    }

    return data.user;
  }

  async function waitForSession(sessionId: string): Promise<AuthenticatedUser> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < SESSION_TIMEOUT) {
      const authenticatedUser = await redeemSession(sessionId);

      if (authenticatedUser) {
        return authenticatedUser;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error('Authentication session expired.');
  }

  async function signIn() {
    setLoading(true);

    try {
      // 1. Create a backend session.
      const sessionId = await createSession();

      // 2. Prepare the hosted login URL.
      const loginUrl = new URL(FRONTEND_AUTH_URL);
      loginUrl.searchParams.set('sessionId', sessionId);
      loginUrl.searchParams.set('platform', Platform.OS);

      let authenticatedUser: AuthenticatedUser;

      if (Platform.OS === 'ios') {
        // 3a. Open the browser without using an auth callback.
        const browserPromise = WebBrowser.openBrowserAsync(loginUrl.toString());

        // Poll while the browser is open.
        const outcome = await Promise.race([
          waitForSession(sessionId).then((user) => ({
            type: 'completed' as const,
            user,
          })),
          browserPromise.then((result) => ({
            type: 'browser' as const,
            result,
          })),
        ]);

        if (outcome.type === 'browser') {
          throw new Error('Authentication browser was closed.');
        }

        authenticatedUser = outcome.user;

        // 4a. Close the browser after retrieving the user.
        await WebBrowser.dismissBrowser().catch(() => undefined);
        await browserPromise;
      } else {
        // 3b. Android requires the callback to close the Custom Tab.
        const result = await WebBrowser.openAuthSessionAsync(
          loginUrl.toString(),
          'app://auth/complete',
        );

        if (result.type !== 'success') {
          throw new Error('Authentication was cancelled.');
        }

        // 4b. The backend completion request finished before
        // the hosted page redirected to this callback.
        const resultUser = await redeemSession(sessionId);

        if (!resultUser) {
          throw new Error('Authentication has not completed.');
        }

        authenticatedUser = resultUser;
      }

      setUser(authenticatedUser);

      Alert.alert('Success', `Welcome ${authenticatedUser.email ?? 'User'}`);
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
