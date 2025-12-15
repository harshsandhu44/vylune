'use client';

import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
      signUpVerificationMethod: 'code' as const,
    },
  },
};

let isConfigured = false;

export const configureAmplify = () => {
  if (typeof window !== 'undefined' && !isConfigured) {
    Amplify.configure(amplifyConfig, { ssr: true });
    isConfigured = true;
  }
};
