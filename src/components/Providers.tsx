'use client'

import { ReactNode, useEffect, useState } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  useEffect(() => {
    if (!privyAppId) {
      console.error(
        '❌ NEXT_PUBLIC_PRIVY_APP_ID is not set. Add it to your .env.local file.'
      )
    }
  }, [])

  if (!privyAppId) return null

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['wallet', 'email', 'sms'], // ← supports more flexible logins
        appearance: {
          theme: 'dark',
          accentColor: '#4f46e5',
          logo: '/logo.png', // optional
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // enable smart wallets automatically
        },
        // Optional callback hooks (removed: onSuccess, onLogout - not valid in PrivyClientConfig)
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
