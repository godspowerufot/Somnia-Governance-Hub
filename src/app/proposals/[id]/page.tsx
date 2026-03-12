'use client';

import { useEffect, useState } from "react";
import { useProposal } from "@/hooks/useProposals";
import { formatEther } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useSomniaReactivity } from "@/hooks/useSomniaReactivity";
import { ContractService } from "@/services/contractService";
import { useToast } from "@/components/Toast";
import ProposalChart from "@/components/ProposalChart";
import { TransactionOverlay } from "@/components/TransactionOverlay";

export default function ProposalDetailsPage({ params }: { params: { id: string } }) {
    const { proposal, events, loading, refresh } = useProposal(params.id);
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const sdk = useSomniaReactivity();
    const { showToast } = useToast();

    const [amount, setAmount] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [status, setStatus] = useState("Initializing...");

    // Reactive Status Sync: Watch the events stream and catch our transaction
    useEffect(() => {
        if (!isPending || !txHash || events.length === 0) return;

        const found = events.find(e => e.transactionHash === txHash);
        if (found) {
            setStatus("Verified! Pulse Confirmed.");

            // Auto-close after a delay so they see the success
            const timer = setTimeout(() => {
                setIsPending(false);
                setTxHash(null);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [events, isPending, txHash]);

    if (!proposal) {
        if (loading) return <div className="container-minimal py-12 text-center font-mono text-white/20">LOADING PROPOSAL...</div>;
        return <div className="container-minimal py-12 text-center font-mono">PROPOSAL NOT FOUND</div>;
    }

    const handleVote = async (support: boolean) => {
        if (!publicClient || !walletClient) return;
        try {
            setIsPending(true);
            setTxHash(null);
            setStatus(`Casting ${support ? 'YES' : 'NO'} Vote...`);

            const service = new ContractService(publicClient as any, walletClient as any, sdk as any);
            const hash = await service.vote(BigInt(params.id), support);

            setTxHash(hash);
            setStatus("Transaction Sent! Confirming...");

            // Wait for confirmation to provide better UX
            await publicClient.waitForTransactionReceipt({ hash });

            setStatus("Vote Confirmed!");
            showToast(`Vote confirmed!`, "success");

            // Delay closing to show success state
            setTimeout(() => {
                setIsPending(false);
            }, 1500);
        } catch (err) {
            console.error(err);
            showToast("Voting failed: " + (err as any).message, "error");
            setIsPending(false);
        }
    };

    const handleFund = async () => {
        if (!publicClient || !walletClient || !amount) return;
        try {
            setIsPending(true);
            setTxHash(null);
            setStatus(`Adding ${amount} STT to the collective...`);

            const service = new ContractService(publicClient as any, walletClient as any, sdk as any);
            const hash = await service.fund(BigInt(params.id), amount);

            setTxHash(hash);
            setStatus("Contribution Sent! Confirming...");

            // Wait for confirmation
            await publicClient.waitForTransactionReceipt({ hash });

            setStatus("Contribution Successful!");
            showToast(`Funding successful!`, "success");
            setAmount("");

            setTimeout(() => {
                setIsPending(false);
            }, 1500);
        } catch (err) {
            console.error(err);
            showToast("Funding failed: " + (err as any).message, "error");
            setIsPending(false);
        }
    };

    const getStatusString = (status: number) => {
        switch (status) {
            case 0: return "Active";
            case 1: return "Funded";
            case 2: return "Executed";
            case 3: return "Defeated";
            default: return "Unknown";
        }
    };

    return (
        <main className="container-minimal py-12">
            <TransactionOverlay
                isOpen={isPending}
                txHash={txHash}
                status={status}
                onClose={() => setIsPending(false)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details & Voting */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h1 className="text-4xl font-bold mb-4 tracking-tight">{proposal.title}</h1>
                        <div className="mb-8">
                            <span className="px-3 py-1 text-[10px] font-bold border border-accent text-accent uppercase tracking-widest">
                                {getStatusString(proposal.status)}
                            </span>
                        </div>
                        <p className="text-white/70 leading-relaxed text-lg mb-8">
                            {proposal.description}
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase">Voting</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleVote(true)}
                                disabled={isPending || proposal.status !== 0}
                                className="btn-minimal font-bold border-accent text-accent hover:bg-accent/10 disabled:opacity-50"
                            >
                                [ YES ]
                            </button>
                            <button
                                onClick={() => handleVote(false)}
                                disabled={isPending || proposal.status !== 0}
                                className="btn-minimal font-bold border-white text-white hover:bg-white/10 disabled:opacity-50"
                            >
                                [ NO ]
                            </button>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-4">Transaction History</h2>
                        <div className="border border-white/10 divide-y divide-white/5 bg-white/5 rounded-xl overflow-hidden">
                            {events.length === 0 ? (
                                <p className="p-12 text-center text-sm font-mono text-white/30">WAITING FOR NETWORK EVENTS...</p>
                            ) : (
                                events.map((event, i) => (
                                    <div key={i} className="p-5 flex items-center justify-between font-mono text-[10px] hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-accent font-bold uppercase mb-1">{event.eventName}</span>
                                                <span className="text-white/20 whitespace-nowrap">
                                                    BY {(event.args.proposer || event.args.voter || event.args.funder || "0x...").slice(0, 10)}...
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {event.eventName === 'Funded' && (
                                                <span className="text-white text-sm font-bold">+{formatEther(event.args.amount)} STT</span>
                                            )}
                                            {event.eventName === 'Voted' && (
                                                <span className={`${event.args.support ? 'text-accent' : 'text-white/60'} text-sm font-bold`}>
                                                    {event.args.support ? 'VOTED YES' : 'VOTED NO'}
                                                </span>
                                            )}
                                            {event.eventName === 'ProposalCreated' && (
                                                <span className="text-white/60 text-sm">PROPOSAL INITIATED</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Funding Status */}
                <div className="space-y-8">
                    <div className="card-minimal space-y-10 flex flex-col items-center text-center">
                        <div className="w-full flex flex-col items-center">
                            <h2 className="text-xs font-bold text-white/40 mb-8 tracking-widest uppercase w-full text-left">Funding Progress</h2>
                            <ProposalChart current={proposal.currentFunding} goal={proposal.fundingGoal} size={200} strokeWidth={12} />
                            <div className="mt-8 text-xl font-mono text-white/80">
                                {formatEther(proposal.currentFunding)} <span className="text-white/20 text-sm">/ {formatEther(proposal.fundingGoal)} STT</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 w-full border-t border-b border-white/5 py-8">
                            <div>
                                <span className="text-[10px] text-white/40 block uppercase mb-2 tracking-widest">YES VOTES</span>
                                <span className="text-2xl font-mono text-accent">{proposal.yesVotes.toString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-white/40 block uppercase mb-2 tracking-widest">NO VOTES</span>
                                <span className="text-2xl font-mono text-white/60">{proposal.noVotes.toString()}</span>
                            </div>
                        </div>

                        <div className="space-y-5 w-full">
                            <div className="text-left">
                                <label className="text-xs font-bold text-white/40 block uppercase tracking-widest mb-3">Support Proposal</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Contribution Amount (STT)"
                                    className="input-minimal !py-3 !text-base"
                                />
                            </div>
                            <button
                                onClick={handleFund}
                                disabled={isPending || proposal.status !== 0}
                                className="btn-minimal btn-primary w-full font-bold text-xs py-4 disabled:opacity-50"
                            >
                                {isPending ? "PROCESSING..." : "FUND THIS PROPOSAL"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
