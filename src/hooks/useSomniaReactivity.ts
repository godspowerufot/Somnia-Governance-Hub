'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { SDK } from '@somnia-chain/reactivity';

export function useSomniaReactivity() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const [sdk, setSdk] = useState<SDK | null>(null);

    useEffect(() => {
        if (publicClient) {
            const newSdk = new SDK({
                public: publicClient as any,
                wallet: walletClient as any,
            });
            setSdk(newSdk);
        }
    }, [publicClient, walletClient]);

    return sdk;
}
