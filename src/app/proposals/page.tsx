'use client';

import Link from "next/link";
import { useProposals } from "@/hooks/useProposals";
import { formatEther } from "viem";

export default function ProposalsPage() {
    const { proposals, loading, error } = useProposals();

    if (loading) return <div className="container-minimal py-12 text-center font-mono">LOADING PROPOSALS...</div>;
    if (error) return <div className="container-minimal py-12 text-center text-red-500 font-mono">ERROR: {error.message}</div>;

    return (
        <main className="container-minimal py-12">
            <h1 className="text-4xl font-bold mb-8 tracking-tight">Active Proposals</h1>

            {proposals.length === 0 ? (
                <div className="text-center py-20 border border-white/10 bg-white/5">
                    <p className="text-white/40 mb-8 font-mono">NO PROPOSALS FOUND</p>
                    <Link href="/create" className="btn-minimal btn-primary inline-block">CREATE FIRST PROPOSAL</Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {proposals.map((p) => (
                        <div key={p.id.toString()} className="card-minimal flex flex-col md:flex-row justify-between gap-8">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{p.title}</h2>
                                <p className="text-white/60 mb-6 truncate max-w-2xl">{p.description}</p>

                                <div className="flex gap-8 text-sm font-mono">
                                    <div>
                                        <span className="text-white/40 block mb-1">FUNDING</span>
                                        <span>{formatEther(p.currentFunding)} / {formatEther(p.fundingGoal)} STT</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40 block mb-1">VOTES</span>
                                        <div className="flex gap-4">
                                            <span className="text-accent">YES: {p.yesVotes.toString()}</span>
                                            <span>NO: {p.noVotes.toString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-64 flex flex-col justify-between items-end">
                                <div className="w-full h-1 bg-white/10 mb-6">
                                    <div
                                        className="h-full bg-accent"
                                        style={{ width: `${Number(p.fundingGoal) > 0 ? (Number(p.currentFunding) / Number(p.fundingGoal)) * 100 : 0}%` }}
                                    />
                                </div>

                                <Link
                                    href={`/proposals/${p.id}`}
                                    className="btn-minimal btn-secondary w-full text-xs font-bold text-center inline-block"
                                >
                                    VIEW PROPOSAL
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
