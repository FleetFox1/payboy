'use client'
import { createConfig, http } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [arbitrum, arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_ARBITRUM!),
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_ARBITRUM_SEPOLIA!),
  },
  ssr: true,
})
