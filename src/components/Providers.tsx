'use client';

import { ReactNode, useState } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define Somnia Testnet Chain
export const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://api.infra.testnet.somnia.network'],
            webSocket: ['wss://api.infra.testnet.somnia.network']
        }
    },
    blockExplorers: {
        default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network' }
    }
});

const config = createConfig({
    chains: [somniaTestnet],
    connectors: [injected()],
    transports: {
        [somniaTestnet.id]: http(),
    },
});


export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
