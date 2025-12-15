'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInSchema, type SignIn } from '@vylune/core/schemas';
import { handleSignIn } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setPendingSignUp = useAuthStore((state) => state.setPendingSignUp);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignIn>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignIn) => {
    try {
      setError(null);

      const { token, cognitoId } = await handleSignIn(data);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/trpc/user.getByCognitoId?input=${encodeURIComponent(JSON.stringify({ cognitoId }))}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('User not found in database');
      }

      const result = await response.json();
      const user = result.result.data;

      if (!user) {
        throw new Error('User not found in database');
      }

      setAuth(token, user.id, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      router.push('/');
    } catch (err: any) {
      console.error('Sign in error:', err);

      if (err.message === 'CONFIRM_REQUIRED') {
        setPendingSignUp({
          email: data.email,
          password: data.password,
          name: '',
          cognitoId: '',
          timestamp: Date.now(),
        });

        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }

      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Continue'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/sign-up" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
