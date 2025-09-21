'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error occurred while constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error occurred while handling the OAuth callback.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error occurred in the OAuth callback handler route.';
      case 'OAuthAccountNotLinked':
        return 'Email is already associated with another account. Please sign in with your original account.';
      case 'EmailSignin':
        return 'Check your email for the verification link.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <Container className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h1>
        <p className="mt-4 text-gray-600">
          {getErrorMessage(error)}
        </p>
        {error && (
          <p className="mt-2 text-sm text-gray-500">
            Error code: {error}
          </p>
        )}
        <div className="mt-8 space-y-3">
          <Link href="/auth/login">
            <Button className="w-full">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <Container className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-gray-500">Loading...</div>
        </Card>
      </Container>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}