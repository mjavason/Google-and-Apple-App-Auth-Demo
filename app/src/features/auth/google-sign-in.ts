import {
  API_URL,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
} from '@/common/constants/env.constants';
import { auth } from '@/lib/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

GoogleSignin.configure({
  webClientId: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export interface BackendUser {
  success: boolean;
  uid: string;
  email: string;
  name: string;
  photo: string;
}

export async function googleLogin(): Promise<BackendUser | null> {
  // 1. Open Google's sign-in UI.
  await GoogleSignin.hasPlayServices();
  console.log(EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  const googleResult = await GoogleSignin.signIn();
  console.log('reaching here');

  // The user cancelled the flow.
  if (googleResult.type !== 'success') {
    return null;
  }

  // 2. Get the Google ID token.
  const googleIdToken = googleResult.data.idToken;

  if (!googleIdToken) {
    throw new Error('Google did not return an ID token');
  }

  // 3. Exchange the Google credential for a Firebase session.
  const credential = GoogleAuthProvider.credential(googleIdToken);

  const firebaseResult = await signInWithCredential(auth, credential);

  // 4. Get the Firebase ID token expected by your backend.
  const firebaseIdToken = await firebaseResult.user.getIdToken();

  // 5. Send it to Express.
  const response = await fetch(`${API_URL}/firebase/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken: firebaseIdToken,
    }),
  });

  const data: BackendUser | { success: false; message: string } =
    await response.json();

  // 6. Handle backend errors.
  if (!response.ok || !data.success) {
    throw new Error('message' in data ? data.message : 'Authentication failed');
  }

  // 7. Return the user created or identified by your backend.
  return data;
}
