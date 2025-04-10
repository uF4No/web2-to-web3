import { http, createConfig } from 'wagmi'
import { sepolia, zksyncSepoliaTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [zksyncSepoliaTestnet, sepolia],
  connectors: [
    injected(),
    // Remove other connectors to only use injected
  ],
  transports: {
    [zksyncSepoliaTestnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
