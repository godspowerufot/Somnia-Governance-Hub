'use client';

import React from 'react';

interface TransactionOverlayProps {
    isOpen: boolean;
    txHash: string | null;
    status: string;
    onClose?: () => void;
    showHash?: boolean;
    isSuccess?: boolean;
    countdown?: number;
    currentStep?: number;
}

export function TransactionOverlay({
    isOpen,
    txHash,
    status,
    onClose,
    showHash = false,
    isSuccess = false,
    countdown = 0,
    currentStep = 1
}: TransactionOverlayProps) {
    if (!isOpen) return null;

    const steps = [
        "Sending Transaction",
        "Confirming on Chain",
        "Action Completed"
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative max-w-lg w-full p-12 text-center space-y-10">
                {/* Visual Indicator */}
                <div className="relative w-48 h-48 mx-auto">
                    {/* Background Glow */}
                    <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-1000 ${isSuccess ? 'bg-accent/40' : 'bg-accent/10'}`} />

                    {/* Rotating Rings */}
                    <div className={`absolute inset-0 border-2 border-accent/20 rounded-full ${!isSuccess && 'animate-[spin_6s_linear_infinite]'}`} />
                    <div className={`absolute inset-0 border-t-2 border-accent rounded-full ${!isSuccess ? 'animate-[spin_2s_linear_infinite]' : 'rotate-0 overflow-hidden'}`} />

                    {/* Center Core */}
                    <div className={`absolute inset-[30%] ${isSuccess ? 'bg-accent' : 'bg-white/5'} flex items-center justify-center transition-all duration-700 shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)] rounded-2xl rotate-45`}>
                        <div className="-rotate-45">
                            {isSuccess ? (
                                <span className="text-black text-4xl animate-in zoom-in-50 duration-500">✓</span>
                            ) : (
                                <span className="text-accent text-3xl animate-pulse">⚡</span>
                            )}
                        </div>
                    </div>

                    {/* Countdown Progress Ring (only on success) */}
                    {isSuccess && countdown > 0 && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="90"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-accent/10"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="90"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray={565.48}
                                strokeDashoffset={565.48 * (1 - countdown / 5)}
                                className="text-accent transition-all duration-1000 ease-linear"
                            />
                        </svg>
                    )}
                </div>

                {/* Status & Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter text-white">
                        {isSuccess ? "Success!" : status}
                    </h2>
                    {isSuccess && countdown > 0 && (
                        <p className="text-white/40 font-mono text-sm uppercase tracking-widest animate-pulse">
                            Redirecting in {countdown}s...
                        </p>
                    )}
                </div>

                {/* Steps Indicator */}
                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto pt-4">
                    {steps.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isActive = currentStep === stepNum;
                        const isCompleted = currentStep > stepNum || isSuccess;

                        return (
                            <div key={idx} className="space-y-3">
                                <div className={`h-1 rounded-full transition-all duration-700 ${isCompleted ? 'bg-accent' : isActive ? 'bg-white/40' : 'bg-white/10'}`} />
                                <span className={`text-[8px] font-bold uppercase tracking-tighter block whitespace-nowrap ${isCompleted || isActive ? 'text-white' : 'text-white/20'}`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>


                {showHash && txHash && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 group hover:border-accent/30 transition-colors">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Transaction Hash</span>
                        <a
                            href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-accent hover:text-white transition-colors break-all block"
                        >
                            {txHash.slice(0, 14)}...{txHash.slice(-14)}
                        </a>
                    </div>
                )}

                {!isSuccess && onClose && (
                    <button
                        onClick={onClose}
                        className="text-xs text-white/30 hover:text-white underline transition-colors pt-4 uppercase tracking-[0.2em]"
                    >
                        Back to Editor
                    </button>
                )}
            </div>
        </div>
    );
}
