'use client';

import { useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { ContractService } from "@/services/contractService";
import { useSomniaReactivity } from "@/hooks/useSomniaReactivity";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useEffect } from "react";
import { SOMNIA_GOVERNANCE_ABI, SOMNIA_GOVERNANCE_ADDRESS } from "@/contracts/daoAbi";
import { decodeEventLog } from "viem";
import { TransactionOverlay } from "@/components/TransactionOverlay";

export default function CreateProposalPage() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const sdk = useSomniaReactivity();
    const router = useRouter();
    const { showToast } = useToast();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [goal, setGoal] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [status, setStatus] = useState("Initializing...");

    // Reactive Redirection based on Somnia Reactivity
    useEffect(() => {
        if (!sdk || !isPending || !txHash) return;

        let subscription: any;

        const setupReactivity = async () => {
            try {
                setStatus("Waiting for Somnia Reactive Node...");
                subscription = await sdk.subscribe({
                    ethCalls: [],
                    eventContractSources: [SOMNIA_GOVERNANCE_ADDRESS],
                    onData: (data: any) => {
                        try {
                            const decoded = decodeEventLog({
                                abi: SOMNIA_GOVERNANCE_ABI,
                                data: data.data,
                                topics: data.topics,
                            });

                            if (decoded.eventName === 'ProposalCreated') {
                                const args = decoded.args as any;
                                // Verify it's our proposal (by proposer)
                                if (args.proposer.toLowerCase() === walletClient?.account?.address.toLowerCase()) {
                                    setStatus("Verified! Redirecting...");
                                    showToast("Proposal Created Successfully!", "success");

                                    // Give a small delay for the user to see the "Verified" status
                                    setTimeout(() => {
                                        setIsPending(false);
                                        router.push("/");
                                    }, 1500);
                                }
                            }
                        } catch (err) {
                            // Skip unrelated events
                        }
                    }
                });
            } catch (err) {
                console.error("Reactivity subscription failed:", err);
            }
        };

        setupReactivity();

        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, [sdk, isPending, txHash, walletClient, router, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicClient || !walletClient || !title || !description || !goal) return;

        try {
            setIsPending(true);
            setTxHash(null);
            setStatus("Sending Transaction...");

            const service = new ContractService(publicClient as any, walletClient as any, sdk as any);
            const hash = await service.createProposal(title, description, goal);

            setTxHash(hash);
            setStatus("Transaction Sent! Confirming...");
            console.log("Proposal creation transaction sent:", hash);
        } catch (err) {
            console.error(err);
            showToast("Failed to create proposal: " + (err as any).message, "error");
            setIsPending(false);
        }
    };

    return (
        <main className="container-minimal py-12 max-w-[800px]">
            <TransactionOverlay
                isOpen={isPending}
                txHash={txHash}
                status={status}
            />

            <h1 className="text-4xl font-bold mb-2 tracking-tight">Create Proposal</h1>
            <p className="text-white/50 mb-12">Submit a new governance proposal to the Somnia DAO.</p>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 tracking-widest uppercase">
                        Proposal Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Build Somnia Analytics Dashboard"
                        className="input-minimal"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 tracking-widest uppercase">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your proposal in detail..."
                        className="input-minimal h-48 resize-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 tracking-widest uppercase">
                        Funding Goal (STT)
                    </label>
                    <input
                        type="number"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="1000"
                        className="input-minimal"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-minimal btn-primary w-full font-bold disabled:opacity-50"
                    >
                        {isPending ? "SUBMITTING..." : "SUBMIT PROPOSAL"}
                    </button>
                </div>
            </form>
        </main>
    );
}
