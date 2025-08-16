<<<<<<< HEAD
// Privy auth + client init
// TODO: Implement Privy client logic here
=======
'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
>>>>>>> 5f6a7a0637d550d2996625126b969316de081e8a
