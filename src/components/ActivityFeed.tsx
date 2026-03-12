'use client';

import React from 'react';
import { formatEther } from 'viem';

interface ActivityEvent {
    eventName: string;
    transactionHash: string;
    blockNumber?: bigint;
    from?: string;
    args?: any;
    value?: string;
    timeStamp?: string;
}

interface ActivityFeedProps {
    events: ActivityEvent[];
    loading: boolean;
}

export function ActivityFeed({ events, loading }: ActivityFeedProps) {
    const getNarration = (event: ActivityEvent) => {
        const address = event.from ||
            event.args?.voter ||
            event.args?.funder ||
            event.args?.proposer ||
            '0x...';
        const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

        switch (event.eventName) {
            case 'ProposalCreated':
                return (
                    <p className="text-[11px] leading-relaxed">
                        <span className="text-white font-bold">{shortAddr}</span> initiated a new governance <span className="text-accent">PROPOSAL</span> #{event.args?.id?.toString() || '?'}.
                    </p>
                );
            case 'Funded':
                const amount = event.args?.amount || event.value || 0n;
                const formattedAmount = formatEther(BigInt(amount));
                return (
                    <p className="text-[11px] leading-relaxed">
                        <span className="text-white font-bold">{shortAddr}</span> contributed <span className="text-accent font-bold">{formattedAmount} STT</span> to support the collective.
                    </p>
                );
            case 'Voted':
                return (
                    <p className="text-[11px] leading-relaxed">
                        <span className="text-white font-bold">{shortAddr}</span> cast a <span className={event.args?.support ? 'text-accent font-bold' : 'text-white/60 font-bold'}>{event.args?.support ? 'SUPPORT' : 'OPPOSE'}</span> vote on proposal history.
                    </p>
                );
            case 'StatusChanged':
                return (
                    <p className="text-[11px] leading-relaxed">
                        Protocol state transition: Proposal #{event.args?.id?.toString()} moved to <span className="text-white font-bold uppercase">{event.args?.newStatus}</span>.
                    </p>
                );
            default:
                return (
                    <p className="text-[11px] leading-relaxed text-white/40">
                        Network transaction detected from <span className="text-white/60">{shortAddr}</span>.
                    </p>
                );
        }
    };

    const getIcon = (eventName: string) => {
        switch (eventName) {
            case 'ProposalCreated': return '✦';
            case 'Funded': return '◈';
            case 'Voted': return '◎';
            case 'StatusChanged': return '⚠';
            default: return '⚡';
        }
    };

    if (loading && events.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4 p-4 border border-white/5 bg-white/[0.01] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-white/5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-2 bg-white/5 rounded w-3/4" />
                            <div className="h-2 bg-white/5 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {events.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-white/5 rounded-lg">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Awaiting Pulse...</p>
                </div>
            ) : (
                events.map((event, i) => (
                    <div
                        key={`${event.transactionHash}-${i}`}
                        className="group flex gap-4 p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all rounded-lg relative overflow-hidden"
                    >
                        {/* Decorative background pulse for new events */}
                        {i === 0 && (
                            <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />
                        )}

                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center text-accent text-xs font-bold shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)] group-hover:border-accent/40 transition-colors">
                            {getIcon(event.eventName)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                                    {event.eventName}
                                </span>
                                <span className="text-[9px] font-mono text-white/20">
                                    {event.blockNumber?.toString() ? `#${event.blockNumber.toString().slice(-6)}` : 'PENDING'}
                                </span>
                            </div>

                            <div className="font-mono text-white/80">
                                {getNarration(event)}
                            </div>

                            <div className="mt-2 flex items-center gap-3">
                                <a
                                    href={`https://shannon-explorer.somnia.network/tx/${event.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[8px] font-mono text-white/20 hover:text-accent transition-colors uppercase tracking-widest"
                                >
                                    View Receipt →
                                </a>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
