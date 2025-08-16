'use client'

import { ReactNode, useEffect, useState } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { arbitrum } from 'wagmi/chains'

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
        loginMethods: ['email', 'wallet', 'sms'],
        appearance: {
          theme: 'light',
          accentColor: '#3b82f6',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [arbitrum], // Fixed: Added arbitrum chain
        defaultChain: arbitrum, // Fixed: Use the imported arbitrum object, not string
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