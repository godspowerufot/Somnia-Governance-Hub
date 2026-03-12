'use client';

import React from 'react';

interface TransactionOverlayProps {
    isOpen: boolean;
    txHash: string | null;
    status: string;
    onClose?: () => void;
}

export function TransactionOverlay({ isOpen, txHash, status, onClose }: TransactionOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative max-w-md w-full p-8 text-center space-y-8">
                {/* Gamified Spinner */}
                <div className="relative w-48 h-48 mx-auto">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 border-4 border-accent/20 rounded-full animate-[spin_4s_linear_infinite]" />
                    <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-[spin_2s_linear_infinite]" />

                    {/* Inner pulsing geometric shapes */}
                    <div className="absolute inset-8 border border-white/10 rotate-45 animate-[pulse_2s_ease-in-out_infinite]" />
                    <div className="absolute inset-12 border border-accent/40 -rotate-12 animate-[pulse_3s_ease-in-out_infinite]" />

                    {/* Center Core */}
                    <div className="absolute inset-[40%] bg-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] rounded-sm animate-pulse flex items-center justify-center">
                        <span className="text-black text-xl font-bold">⚡</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tighter text-white uppercase italic">
                        {status}
                    </h2>
                    <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">
                        Communicating with Somnia Reactive Network...
                    </p>
                </div>

                {txHash && (
                    <div className="pt-8 space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest block">Transaction Hash</span>
                            <a
                                href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-accent hover:underline break-all block"
                            >
                                {txHash}
                            </a>
                        </div>
                        <p className="text-[10px] text-white/30 italic">
                            Redirection will occur automatically upon reactive verification.
                        </p>
                    </div>
                )}

                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-[10px] text-white/20 hover:text-white underline transition-colors pt-4 uppercase tracking-widest"
                    >
                        Close Overlay
                    </button>
                )}
            </div>
        </div>
    );
}
