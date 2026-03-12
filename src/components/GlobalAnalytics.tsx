'use client';

import React from 'react';
import { formatEther } from 'viem';

interface GlobalAnalyticsProps {
    stats: {
        proposals: bigint;
        funding: bigint;
        votes: bigint;
    };
}

export function GlobalAnalytics({ stats }: GlobalAnalyticsProps) {
    // We treat 1000 STT as a "Milestone" for visual scaling if no other context exists
    const milestone = 1000n * 10n ** 18n;
    const fundingProgress = Number(stats.funding * 100n / (stats.funding > milestone ? stats.funding * 120n / 100n : milestone));

    return (
        <div className="card-minimal p-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex-1 text-left">
                    <h3 className="text-sm font-mono text-white/40 uppercase mb-6 tracking-widest">DAO Ecosystem Health</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between text-[10px] font-mono mb-2">
                                <span className="text-white/60">CUMULATIVE FUNDING</span>
                                <span className="text-accent">{formatEther(stats.funding)} STT</span>
                            </div>
                            <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <span className="block text-[10px] font-mono text-white/40 mb-1">PROPOSALS</span>
                                <span className="text-2xl font-bold">{stats.proposals.toString()}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-mono text-white/40 mb-1">TOTAL VOTES</span>
                                <span className="text-2xl font-bold">{stats.votes.toString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="1"
                            fill="transparent"
                            className="text-white/5"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            strokeDasharray={552.92}
                            strokeDashoffset={552.92 - (552.92 * Math.min(fundingProgress, 100)) / 100}
                            className="text-accent transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Activity Index</span>
                        <span className="text-3xl font-bold">{(Number(stats.votes) + Number(stats.proposals) * 10).toString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
