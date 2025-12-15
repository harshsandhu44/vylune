import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode,
} from 'aws-amplify/auth';
import { useAuthStore } from '@/stores/auth.store';
import { type SignIn as SignInData, type SignUp as SignUpData } from '@vylune/core/schemas';

export async function handleSignIn(credentials: SignInData) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: credentials.email,
      password: credentials.password,
    });

    if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      throw new Error('CONFIRM_REQUIRED');
    }

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
  } catch (error: any) {
    if (error.name === 'UserNotConfirmedException' || error.message === 'CONFIRM_REQUIRED') {
      throw new Error('CONFIRM_REQUIRED');
    }
    throw error;
  }
}

export async function handleSignUp(data: SignUpData) {
  const result = await signUp({
    username: data.email,
    password: data.password,
    options: {
      userAttributes: {
        email: data.email,
        name: data.name,
      },
      autoSignIn: false,
    },
  });

  return {
    userId: result.userId,
    email: data.email,
    name: data.name,
    nextStep: result.nextStep,
    isSignUpComplete: result.isSignUpComplete,
  };
}

export async function handleConfirmSignUp(email: string, code: string) {
  const { isSignUpComplete } = await confirmSignUp({
    username: email,
    confirmationCode: code,
  });

  if (!isSignUpComplete) {
    throw new Error('Sign up confirmation failed');
  }

  return { isSignUpComplete };
}

export async function handleResendSignUpCode(email: string) {
  const { destination } = await resendSignUpCode({
    username: email,
  });

  return { destination };
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
