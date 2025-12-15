import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';
import { useAuthStore } from '@/stores/auth.store';
import { type SignIn as SignInData, type SignUp as SignUpData } from '@vylune/core/schemas';

export async function handleSignIn(credentials: SignInData) {
  const { isSignedIn } = await signIn({
    username: credentials.email,
    password: credentials.password,
  });

  if (!isSignedIn) {
    throw new Error('Sign in failed');
  }

  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('Failed to get authentication token');
  }

  const user = await getCurrentUser();
  const cognitoId = user.userId;

  return { token, cognitoId, email: credentials.email };
}

export async function handleSignUp(data: SignUpData) {
  const { userId } = await signUp({
    username: data.email,
    password: data.password,
    options: {
      userAttributes: {
        email: data.email,
        name: data.name,
      },
      autoSignIn: true,
    },
  });

  return { userId, email: data.email, name: data.name };
}

export async function handleSignOut() {
  await signOut();
  useAuthStore.getState().clearAuth();
}

export async function refreshAuthToken() {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    return session.tokens?.idToken?.toString();
  } catch (error) {
    useAuthStore.getState().clearAuth();
    return null;
  }
}
