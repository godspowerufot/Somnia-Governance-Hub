import { PublicClient, WalletClient, parseEther, formatEther, parseGwei, decodeEventLog } from 'viem';
import { SOMNIA_GOVERNANCE_ABI, SOMNIA_GOVERNANCE_ADDRESS } from '../contracts/daoAbi';
import { SDK } from '@somnia-chain/reactivity';

const SOMNIA_FEES = {
    maxPriorityFeePerGas: parseGwei('2.5'), // Slightly higher for better priority
    maxFeePerGas: parseGwei('12'),      // Increased ceiling
};

export class ContractService {
    private publicClient: PublicClient;
    private walletClient?: WalletClient;
    private sdk?: SDK;
    private contractAddress: `0x${string}`;

    constructor(publicClient: PublicClient, walletClient?: WalletClient, sdk?: SDK) {
        this.publicClient = publicClient;
        this.walletClient = walletClient;
        this.sdk = sdk;
        this.contractAddress = SOMNIA_GOVERNANCE_ADDRESS;
    }


    private async callWithGasBuffer(params: any) {
        if (!this.walletClient || !this.walletClient.account) throw new Error("Wallet not connected");

        const account = this.walletClient.account;

        try {
            // First estimate gas precisely
            const gasEstimate = await this.publicClient.estimateContractGas({
                ...params,
                account,
            });

            // Add 100% buffer (double the estimate) to ensure reliability for complex multi-step DAO logic
            const bufferedGas = (gasEstimate * 200n) / 100n;

            const { request } = await this.publicClient.simulateContract({
                ...params,
                account,
                ...SOMNIA_FEES,
                gas: bufferedGas
            });

            return await this.walletClient.writeContract(request as any);
        } catch (error) {
            console.error("Gas estimation or simulation failed, falling back to safe defaults:", error);

            // Fallback: Use a very generous manual gas limit (5M) if estimation fails.
            // This is critical for wallets like MetaMask that may block signing 
            // if they can't determine gas limits for the Somnia chain.
            return await this.walletClient.writeContract({
                ...params,
                account,
                ...SOMNIA_FEES,
                gas: 5000000n
            } as any);
        }
    }


    async createProposal(title: string, description: string, fundingGoal: string) {
        return this.callWithGasBuffer({
            address: this.contractAddress,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'createProposal',
            args: [title, description, parseEther(fundingGoal)],
        });
    }

    async vote(proposalId: bigint, support: boolean) {
        return this.callWithGasBuffer({
            address: this.contractAddress,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'vote',
            args: [proposalId, support],
        });
    }

    async fund(proposalId: bigint, amount: string) {
        return this.callWithGasBuffer({
            address: this.contractAddress,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'fund',
            args: [proposalId],
            value: parseEther(amount),
        });
    }



    async getProposal(id: bigint) {
        return await this.publicClient.readContract({
            address: this.contractAddress,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'proposals',
            args: [id],
        });
    }

    async getTotalProposals() {
        return await this.publicClient.readContract({
            address: this.contractAddress,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'totalProposals',
        });
    }

    async getGlobalStats() {
        return await this.publicClient.readContract({
            address: this.contractAddress,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'getGlobalStats',
        });
    }

    async getProposalLogs(id: bigint) {
        // Somnia Testnet RPC limits eth_getLogs to 1000 blocks (500 recommended for stability)
        const latestBlock = await this.publicClient.getBlockNumber();
        const fromBlock = latestBlock > 500n ? latestBlock - 500n : 0n;

        // Fetch all logs from the contract in one call for efficiency
        const logs = await this.publicClient.getLogs({
            address: this.contractAddress,
            fromBlock,
            toBlock: latestBlock,
        });

        // Use SOMNIA_GOVERNANCE_ABI to decode and filter for this proposal
        return logs.map(log => {
            try {
                const decoded = decodeEventLog({
                    abi: SOMNIA_GOVERNANCE_ABI,
                    data: log.data,
                    topics: log.topics,
                });

                // Robust ID check (handle ID 0 correctly)
                const args = decoded.args as any;
                const eventId = args.id !== undefined ? args.id : args.proposalId;

                if (eventId !== undefined && BigInt(eventId) === id) {
                    return { ...decoded, blockNumber: log.blockNumber, transactionHash: log.transactionHash };
                }
                return null;
            } catch (e) {
                return null;
            }
        }).filter(Boolean).sort((a: any, b: any) => Number(b.blockNumber - a.blockNumber));
    }

    async getAllContractLogs() {
        const latestBlock = await this.publicClient.getBlockNumber();
        const fromBlock = latestBlock > 500n ? latestBlock - 500n : 0n;

        const logs = await this.publicClient.getLogs({
            address: this.contractAddress,
            fromBlock,
            toBlock: latestBlock,
        });

        return logs.map(log => {
            try {
                const decoded = decodeEventLog({
                    abi: SOMNIA_GOVERNANCE_ABI,
                    data: log.data,
                    topics: log.topics,
                });
                return { ...decoded, blockNumber: log.blockNumber, transactionHash: log.transactionHash };
            } catch (e) {
                return null;
            }
        }).filter(Boolean).sort((a: any, b: any) => Number(b.blockNumber - a.blockNumber));
    }

    async getContractTransactions() {
        try {
            const response = await fetch(`https://shannon-explorer.somnia.network/api?module=account&action=txlist&address=${this.contractAddress}&sort=desc`);
            const data = await response.json();

            if (data.status === '1' && Array.isArray(data.result)) {
                return data.result.map((tx: any) => {
                    // Try to identify method name from methodId if possible
                    // In a more complex setup, we could use an ABI decoder here
                    let eventName = 'Transaction';
                    if (tx.methodId === '0x0ce0ebf4') eventName = 'ProposalCreated';
                    else if (tx.methodId === '0xca1d209d') eventName = 'Funded';
                    else if (tx.methodId === '0xc9d27afe') eventName = 'Voted';
                    else if (tx.methodId === '0x') eventName = 'Transfer';

                    let reason = '';
                    if (tx.isError === '1') {
                        if (tx.methodId === '0xca1d209d') reason = 'OUT_OF_GAS';
                        else reason = tx.errCode || 'REVERTED';
                    }

                    return {
                        eventName,
                        transactionHash: tx.hash,
                        blockNumber: BigInt(tx.blockNumber),
                        from: tx.from,
                        to: tx.to,
                        value: tx.value,
                        timeStamp: tx.timeStamp,
                        status: tx.isError === '0' ? 'Success' : 'Failed',
                        reason,
                        methodId: tx.methodId,
                        args: {} // Simple placeholder for alignment with event structure
                    };
                });
            }
            return [];
        } catch (error) {
            console.error("Failed to fetch transactions from explorer:", error);
            return [];
        }
    }
}
