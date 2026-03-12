'use client';

import React from 'react';
import { formatEther } from 'viem';

interface TransactionTableProps {
    events: any[];
    loading: boolean;
}

export function TransactionTable({ events, loading }: TransactionTableProps) {
    if (loading && events.length === 0) {
        return (
            <div className="py-20 text-center border border-white/5 bg-white/[0.01] rounded-xl">
                <div className="inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-mono text-white/20 uppercase tracking-widest">Synchronizing with Somnia Network...</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden border border-white/5 bg-white/[0.01] rounded-xl">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left font-mono text-[10px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 font-bold text-white/40 uppercase tracking-widest">Event/Method</th>
                            <th className="px-6 py-4 font-bold text-white/40 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-white/40 uppercase tracking-widest">From</th>
                            <th className="px-6 py-4 font-bold text-white/40 uppercase tracking-widest">Transaction Hash</th>
                            <th className="px-6 py-4 font-bold text-white/40 uppercase tracking-widest">Reason</th>
                            <th className="px-6 py-4 font-bold text-white/40 uppercase tracking-widest text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/20 uppercase tracking-widest italic">
                                    No network events detected in current range
                                </td>
                            </tr>
                        ) : (
                            events.map((event, i) => (
                                <tr key={`${event.transactionHash}-${i}`} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                                            <span className="text-accent font-bold uppercase">{event.eventName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {event.status === 'Success' ? (
                                            <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-bold uppercase tracking-tighter">
                                                Success
                                            </span>
                                        ) : event.status === 'Failed' ? (
                                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-bold uppercase tracking-tighter">
                                                Failed
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[8px] font-bold uppercase tracking-tighter">
                                                Confirmed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white/40 font-mono">
                                            {event.from ? `${event.from.slice(0, 6)}...${event.from.slice(-4)}` :
                                                (event.args?.voter ? `${event.args.voter.slice(0, 6)}...${event.args.voter.slice(-4)}` :
                                                    (event.args?.funder ? `${event.args.funder.slice(0, 6)}...${event.args.funder.slice(-4)}` :
                                                        (event.args?.proposer ? `${event.args.proposer.slice(0, 6)}...${event.args.proposer.slice(-4)}` : '0x...')))
                                            }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`https://shannon-explorer.somnia.network/tx/${event.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/40 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-6)}
                                            <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </td>
                                    <td className={`px-6 py-4 italic text-[9px] max-w-[150px] truncate ${event.status === 'Failed' ? 'text-red-500 font-bold' : 'text-white/40'}`}>
                                        {event.reason || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {event.eventName === 'Funded' && (
                                            <span className="text-white font-bold">+{formatEther(event.args?.amount || event.value || 0n)} STT</span>
                                        )}
                                        {event.eventName === 'Voted' && (
                                            <span className={event.args?.support ? 'text-accent' : 'text-white/60'}>
                                                {event.args?.support ? 'SUPPORT' : 'OPPOSE'}
                                            </span>
                                        )}
                                        {event.eventName === 'ProposalCreated' && (
                                            <span className="text-white/60">PROP #{event.args?.id?.toString() || '?'}</span>
                                        )}
                                        {event.eventName === 'StatusChanged' && (
                                            <span className="text-white/60">STATUS: {event.args?.newStatus}</span>
                                        )}
                                        {event.eventName === 'Transaction' && event.value && event.value !== '0' && (
                                            <span className="text-white/60">{formatEther(BigInt(event.value))} STT</span>
                                        )}
                                        {event.eventName === 'Transfer' && (
                                            <span className="text-white/60">{formatEther(BigInt(event.value))} STT</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/20 uppercase tracking-widest">Data Stream Status:</span>
                    <span className="text-[9px] text-accent font-bold uppercase tracking-widest animate-pulse">Live</span>
                </div>
                <span className="text-[9px] text-white/20 font-mono italic">Showing latest events from Somnia Testnet</span>
            </div>
        </div>
    );
}
