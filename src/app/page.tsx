'use client';

import React from 'react';
import Link from 'next/link';
import { useProposals, useGlobalStats, useGlobalEvents } from '@/hooks/useProposals';
import { GlobalAnalytics } from '@/components/GlobalAnalytics';
import { TransactionTable } from '@/components/TransactionTable';
import { ActivityFeed } from '@/components/ActivityFeed';
import { GlobalActivityChart } from '@/components/GlobalActivityChart';
import { formatEther } from 'viem';
import ProposalChart from '@/components/ProposalChart';

export default function Home() {
    const { stats, loading: statsLoading } = useGlobalStats();
    const { proposals, loading: proposalsLoading } = useProposals();
    const { events: globalEvents, chartData, loading: eventsLoading } = useGlobalEvents();

    return (
        <main className="container-minimal py-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start    gap-y-4 md:items-end mb-12">
                <div>
                    <h1 className="text-5xl font-bold tracking-tighter mb-2">DASHBOARD</h1>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Somnia Reactive Governance Protocol</p>
                </div>
                <Link href="/create" className="btn-minimal btn-primary">
                    NEW PROPOSAL
                </Link>
            </div>

            {/* Progress Chart Section */}
            <div className="mb-12">
                <GlobalActivityChart data={chartData} loading={eventsLoading} />
            </div>

            {/* Analytics Section */}
            {!statsLoading && <GlobalAnalytics stats={stats} />}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Active Proposals list (Left span 2) */}
                <div className="lg:col-span-2 space-y-20">
                    <section>
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-sm font-mono text-white/60 uppercase tracking-widest">Active Proposals</h2>
                            <span className="text-[10px] font-mono text-white/20">{proposals.length} TOTAL</span>
                        </div>

                        {proposalsLoading ? (
                            <div className="py-20 text-center font-mono text-white/20 text-xs">LOADING PROPOSALS...</div>
                        ) : proposals.length === 0 ? (
                            <div className="py-20 text-center border border-dashed border-white/5 bg-white/[0.01]">
                                <p className="text-white/20 text-xs font-mono mb-6">NO ACTIVE PROPOSALS FOUND</p>
                                <Link href="/create" className="text-accent font-mono text-[10px] hover:underline">[ CREATE PROPOSAL ]</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {proposals.map((p) => (
                                    <Link
                                        key={p.id.toString()}
                                        href={`/proposals/${p.id}`}
                                        className="card-minimal group flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all cursor-pointer border-white/5 overflow-hidden relative"
                                    >
                                        <div className="flex-1 z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-mono text-white/20">#{p.id.toString()}</span>
                                                <h3 className="text-lg font-bold group-hover:text-accent transition-colors">{p.title}</h3>
                                            </div>
                                            <div className="flex gap-6 text-[10px] font-mono text-white/40">
                                                <span>GOAL: {formatEther(p.fundingGoal)} STT</span>
                                                <span>VOTES: {Number(p.yesVotes) + Number(p.noVotes)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 z-10">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-[10px] font-mono text-white/20 uppercase mb-1">FUNDING</div>
                                                <div className="text-sm font-bold">{Math.round((Number(p.currentFunding) / Number(p.fundingGoal)) * 100)}%</div>
                                            </div>
                                            <div className="w-12 h-12">
                                                <ProposalChart
                                                    current={p.currentFunding}
                                                    goal={p.fundingGoal}
                                                    size={48}
                                                    strokeWidth={4}
                                                />
                                            </div>
                                        </div>

                                        {/* Subtle progress background */}
                                        <div
                                            className="absolute bottom-0 left-0 h-[1px] bg-accent/20 transition-all duration-500"
                                            style={{ width: `${Math.min((Number(p.currentFunding) / Number(p.fundingGoal)) * 100, 100)}%` }}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <div className="card-minimal border-white/5 bg-white/[0.01]">
                                <h3 className="text-[10px] font-mono text-white/40 uppercase mb-4 tracking-widest">Network Info</h3>
                                <div className="space-y-4 text-[10px] font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-white/20">CHAIN</span>
                                        <span>SOMNIA TESTNET</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/20">ID</span>
                                        <span>50312</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/20">STATUS</span>
                                        <span className="text-accent flex items-center gap-2">
                                            <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                                            REACTIVE
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-minimal p-6 border-white/5 bg-white/[0.01]">
                                <h3 className="text-[10px] font-mono text-white/40 uppercase mb-4 tracking-widest">DAO Rules</h3>
                                <ul className="space-y-3 text-[10px] font-mono text-white/60">
                                    <li className="flex gap-3">
                                        <span className="text-accent">01</span>
                                        <span>Anyone can create a proposal with a set funding goal.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-accent">02</span>
                                        <span>Voting is open to all community members immediately.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-accent">03</span>
                                        <span>Funding contributes directly to proposal success benchmarks.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-sm font-mono text-white/60 uppercase tracking-widest">Protocol Ledger</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-white/20">EXPLORER HISTORY</span>
                                <span className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
                            </div>
                        </div>
                        <TransactionTable events={globalEvents} loading={eventsLoading} />
                    </section>
                </div>

                {/* Sidebar Info (Right) */}
                <div className="space-y-12">
                    <section>
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-xs font-mono text-accent uppercase tracking-widest">Protocol Pulse</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-accent animate-pulse">LIVE</span>
                            </div>
                        </div>
                        <ActivityFeed events={globalEvents} loading={eventsLoading} />
                    </section>
                </div>
            </div>
        </main>
    );
}
