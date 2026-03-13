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
    const [amount, setAmount] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [status, setStatus] = useState("Initializing...");
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);

    // Countdown and Redirection Logic
    useEffect(() => {
        if (!isSuccess || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/proposals");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSuccess, countdown, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicClient || !walletClient || !title || !description || !goal) return;

        try {
            setIsPending(true);
            setIsSuccess(false);
            setTxHash(null);
            setCurrentStep(1);
            setStatus("Sending Transaction...");

            const service = new ContractService(publicClient as any, walletClient as any, sdk as any);
            const hash = await service.createProposal(title, description, goal);

            setTxHash(hash);
            setCurrentStep(2);
            setStatus("Transaction Sent! Confirming...");
            console.log("Proposal creation transaction sent:", hash);

            // Wait for confirmation
            await publicClient.waitForTransactionReceipt({ hash });

            setCurrentStep(3);
            setIsSuccess(true);
            setCountdown(5); // 5 second countdown before redirect
            showToast("Proposal created successfully!", "success");
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
                showHash={true}
                isSuccess={isSuccess}
                countdown={countdown}
                currentStep={currentStep}
                onClose={() => setIsPending(false)}
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
