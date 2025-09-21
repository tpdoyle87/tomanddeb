'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/auth-context';

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {/* Add any other client-side providers here */}
        {/* For example: */}
        {/* <ToastProvider> */}
        {/* <ThemeProvider> */}
        {children}
        {/* </ThemeProvider> */}
        {/* </ToastProvider> */}
      </AuthProvider>
    </SessionProvider>
  );
}