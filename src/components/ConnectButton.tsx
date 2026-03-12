'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function ConnectButton() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({
        address: address,
    });
    const { connect, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-tight">
                        {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 truncate max-w-[100px]">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
                <button
                    onClick={() => disconnect()}
                    className="btn-minimal text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors border border-white/5 px-2 py-1 rounded"
                >
                    [ DISCONNECT ]
                </button>
            </div>
        );
    }

    return (
        <button
            disabled={isConnecting}
            onClick={() => connect({ connector: injected() })}
            className="btn-minimal btn-primary text-xs py-1.5 px-4 font-bold disabled:opacity-50"
        >
            {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
    );
}
