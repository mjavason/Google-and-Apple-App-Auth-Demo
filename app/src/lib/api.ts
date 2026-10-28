import { auth } from './firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not authenticated');
  }

  // Firebase refreshes the token when necessary.
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
