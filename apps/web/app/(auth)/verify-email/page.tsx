'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VerifyEmailSchema, type VerifyEmail } from '@vylune/core/schemas';
import { handleConfirmSignUp, handleResendSignUpCode, handleSignIn } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();
  const { pendingSignUp, clearPendingSignUp, setAuth } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const email = pendingSignUp?.email || (searchParams.email as string);
  const createUserMutation = trpc.user.create.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<VerifyEmail>({
    resolver: zodResolver(VerifyEmailSchema),
  });

  useEffect(() => {
    setFocus('code');
  }, [setFocus]);

  useEffect(() => {
    if (!email) {
      router.push('/sign-up');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyEmail) => {
    if (!email || !pendingSignUp) {
      setError('Session expired. Please sign up again.');
      router.push('/sign-up');
      return;
    }

    try {
      setError(null);

      await handleConfirmSignUp(email, data.code);

      const { token, cognitoId } = await handleSignIn({
        email: pendingSignUp.email,
        password: pendingSignUp.password,
      });

      // Store token temporarily so tRPC can use it for Authorization header
      useAuthStore.setState({ token });

      const user = await createUserMutation.mutateAsync({
        email: pendingSignUp.email,
        name: pendingSignUp.name,
        role: 'STAFF',
        cognitoId,
      });

      setAuth(token, user.id, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      clearPendingSignUp();
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Verification error:', err);

      let errorMessage = 'Verification failed. Please try again.';

      if (err.name === 'CodeMismatchException' || err.message.includes('Invalid code')) {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (err.name === 'ExpiredCodeException' || err.message.includes('expired')) {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (err.name === 'LimitExceededException' || err.message.includes('limit')) {
        errorMessage = 'Too many attempts. Please request a new code and try again.';
      } else if (err.name === 'NotAuthorizedException') {
        errorMessage = 'Invalid code or code already used. Please request a new one.';
      }

      setError(errorMessage);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Session expired. Please sign up again.');
      return;
    }

    try {
      setError(null);
      setResendMessage(null);

      const { destination } = await handleResendSignUpCode(email);

      setResendMessage(`Code sent to ${destination}`);
      setResendCooldown(60);
    } catch (err: any) {
      console.error('Resend error:', err);

      let errorMessage = 'Failed to resend code. Please try again.';

      if (err.name === 'LimitExceededException' || err.message.includes('limit')) {
        errorMessage = 'Too many resend attempts. Please wait a few minutes and try again.';
      } else if (
        err.name === 'InvalidParameterException' ||
        err.message.includes('already confirmed')
      ) {
        errorMessage = 'Email already verified. Please try signing in.';
        setTimeout(() => router.push('/sign-in'), 2000);
      }

      setError(errorMessage);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              autoComplete="one-time-code"
              {...register('code')}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>

          {resendMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-950 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">{resendMessage}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Didn't receive code?</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
            className="w-full"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/sign-up"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Back to sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
