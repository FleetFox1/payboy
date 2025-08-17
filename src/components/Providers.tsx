'use client'

import { ReactNode, useEffect, useState } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'viem'
import { arbitrum } from 'viem/chains'
import { createConfig } from '@privy-io/wagmi'

const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
})

const queryClient = new QueryClient()

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
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
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#2563eb',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}