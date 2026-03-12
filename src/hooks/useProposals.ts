'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useSomniaReactivity } from './useSomniaReactivity';
import { ContractService } from '../services/contractService';
import { SOMNIA_GOVERNANCE_ABI, SOMNIA_GOVERNANCE_ADDRESS } from '../contracts/daoAbi';
import { keccak256, encodeEventTopics, decodeEventLog, encodeFunctionData, decodeFunctionResult } from 'viem';
import { formatEther } from 'ethers';

export interface Proposal {
    id: bigint;
    proposer: string;
    title: string;
    description: string;
    fundingGoal: bigint;
    currentFunding: bigint;
    yesVotes: bigint;
    noVotes: bigint;
    status: number;
    createdAt: bigint;
}

export interface ChartPoint {
    timestamp: number;
    value: number; // Cumulative funding in STT
}

const formatProposal = (p: any): Proposal => {
    if (!p) return p;
    // If it's an array (positional return from Solidity), map it correctly
    if (Array.isArray(p)) {
        return {
            id: p[0],
            proposer: p[1],
            title: p[2],
            description: p[3],
            fundingGoal: p[4],
            currentFunding: p[5],
            yesVotes: p[6],
            noVotes: p[7],
            status: Number(p[8]),
            createdAt: p[9],
        };
    }
    // If it's already an object, ensure it has the expected properties
    return p as Proposal;
};

export function useProposals() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const sdk = useSomniaReactivity();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const contractAddress = SOMNIA_GOVERNANCE_ADDRESS;

    const fetchProposals = useCallback(async () => {
        if (!publicClient) return;
        try {
            setLoading(true);
            const service = new ContractService(publicClient as any);
            const count = await service.getTotalProposals();
            const fetched: Proposal[] = [];

            // Fetch proposals in reverse order to show newest first
            for (let i = Number(count); i >= 1; i--) {
                const p = await service.getProposal(BigInt(i));
                fetched.push(formatProposal(p));
            }
            setProposals(fetched);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [publicClient]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    // Reactivity Integration
    useEffect(() => {
        if (!sdk || !contractAddress) return;

        console.log("Setting up Somnia Reactivity subscription...");

        let subscription: any;

        const setup = async () => {
            try {
                const result = await sdk.subscribe({
                    ethCalls: [],
                    eventContractSources: [contractAddress],
                    onData: (data: any) => {
                        try {
                            const decoded = decodeEventLog({
                                abi: SOMNIA_GOVERNANCE_ABI,
                                data: data.data,
                                topics: data.topics,
                            });
                            console.log("Reactive event received:", decoded.eventName, decoded.args);
                            // Refresh proposals when any governance event occurs
                            fetchProposals();
                        } catch (err) {
                            // Ignore events that don't match our ABI or fail to decode
                        }
                    },
                    onError: (err) => {
                        console.error("Reactivity error:", err);
                    }
                });

                if (result && !(result instanceof Error)) {
                    subscription = result;
                }
            } catch (err) {
                console.error("Failed to setup reactivity:", err);
            }
        };

        setup();

        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, [sdk, contractAddress, fetchProposals]);

    return { proposals, loading, error, refresh: fetchProposals };
}

export function useProposal(id: string) {
    const publicClient = usePublicClient();
    const sdk = useSomniaReactivity();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const contractAddress = SOMNIA_GOVERNANCE_ADDRESS;

    const fetchProposal = useCallback(async (silent = false) => {
        if (!publicClient || !id || isNaN(Number(id))) return;
        try {
            if (!silent) setLoading(true);
            const service = new ContractService(publicClient as any);
            const p = await service.getProposal(BigInt(id));
            setProposal(formatProposal(p));

            // Fetch historical logs (already decoded and filtered by the service)
            const decodedEvents = await service.getProposalLogs(BigInt(id));
            setEvents(decodedEvents);
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [publicClient, id]);

    useEffect(() => {
        fetchProposal();
    }, [fetchProposal]);

    useEffect(() => {
        if (!sdk || !contractAddress || !id) return;

        console.log(`Setting up reactive subscription for proposal ${id}...`);

        let subscription: any;

        const setup = async () => {
            try {
                const result = await sdk.subscribe({
                    ethCalls: [
                        {
                            to: contractAddress,
                            data: encodeFunctionData({
                                abi: SOMNIA_GOVERNANCE_ABI,
                                functionName: 'proposals',
                                args: [BigInt(id)],
                            }),
                        }
                    ],
                    eventContractSources: [contractAddress],
                    onData: (data: any) => {
                        try {
                            const res = data.result || data;
                            if (!res) return;

                            // 1. Update state from simulationResults if available
                            if (res.simulationResults && res.simulationResults[0]) {
                                const decodedProposal = decodeFunctionResult({
                                    abi: SOMNIA_GOVERNANCE_ABI,
                                    functionName: 'proposals',
                                    data: res.simulationResults[0],
                                });
                                setProposal(formatProposal(decodedProposal));
                            }

                            // 2. Process event
                            if (res.data && res.topics) {
                                const decoded = decodeEventLog({
                                    abi: SOMNIA_GOVERNANCE_ABI,
                                    data: res.data,
                                    topics: res.topics,
                                });

                                // Robust ID check (handle ID 0 correctly)
                                const args = decoded.args as any;
                                const eventId = args.id !== undefined ? args.id : args.proposalId;

                                if (eventId !== undefined && BigInt(eventId).toString() === id) {
                                    console.log(`Reactive event for proposal ${id}:`, decoded.eventName, decoded.args);

                                    // 1. Add to events history (newest first) IMMEDIATELY
                                    setEvents(prev => {
                                        const exists = prev.some(e =>
                                            e.transactionHash === res.transactionHash &&
                                            e.eventName === decoded.eventName
                                        );
                                        const eventWithMetadata = {
                                            ...decoded,
                                            blockNumber: res.blockNumber,
                                            transactionHash: res.transactionHash,
                                            timeStamp: (Date.now() / 1000).toString()
                                        };
                                        return exists ? prev : [eventWithMetadata, ...prev];
                                    });

                                    // 2. Trigger a refresh if simulation results weren't enough, 
                                    // but we've already updated events above for instant visual feedback.
                                    if (!res.simulationResults) {
                                        fetchProposal(true);
                                    }
                                }
                            }
                        } catch (err) {
                            // Silently ignore unrelated events or decoding errors
                        }
                    },
                    onError: (err) => console.error("Reactivity Error:", err)
                });


                if (result && !(result instanceof Error)) {
                    subscription = result;
                }
            } catch (err) {
                console.error("Failed to setup proposal reactivity:", err);
            }
        };

        setup();

        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, [sdk, contractAddress, id, fetchProposal]);

    return { proposal, events, loading, refresh: fetchProposal };
}

export function useGlobalStats() {
    const publicClient = usePublicClient();
    const sdk = useSomniaReactivity();
    const [stats, setStats] = useState({ proposals: 0n, funding: 0n, votes: 0n });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!publicClient) return;
        try {
            const service = new ContractService(publicClient as any);
            const [proposals, funding, votes] = await service.getGlobalStats();
            setStats({ proposals, funding, votes });
        } catch (err) {
            console.error("Failed to fetch global stats:", err);
        } finally {
            setLoading(false);
        }
    }, [publicClient]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        if (!sdk || !SOMNIA_GOVERNANCE_ADDRESS) return;

        let subscription: any;

        const setup = async () => {
            try {
                subscription = await sdk.subscribe({
                    ethCalls: [],
                    eventContractSources: [SOMNIA_GOVERNANCE_ADDRESS],
                    onData: () => {
                        // Any event (ProposalCreated, Voted, Funded) affects global stats
                        fetchStats();
                    }
                });
            } catch (err) {
                console.error("Failed to setup global stats reactivity:", err);
            }
        };

        setup();

        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, [sdk, fetchStats]);

    return { stats, loading, refresh: fetchStats };
}

export function useGlobalEvents() {
    const publicClient = usePublicClient();
    const sdk = useSomniaReactivity();
    const [events, setEvents] = useState<any[]>([]);
    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [loading, setLoading] = useState(true);

    const contractAddress = SOMNIA_GOVERNANCE_ADDRESS;

    const processChartData = useCallback((allEvents: any[]) => {
        // 1. Filter for 'Funded' events and those with values
        const fundingEvents = allEvents
            .filter(e => e.eventName === 'Funded' || (e.value && BigInt(e.value) > 0n))
            .map(e => ({
                timestamp: e.timeStamp ? Number(e.timeStamp) : Date.now() / 1000,
                amount: e.args?.amount ? Number(formatEther(e.args.amount)) :
                    (e.value ? Number(formatEther(BigInt(e.value))) : 0)
            }))
            // Use block number as a proxy for time if timestamp is missing or for sorting
            .sort((a, b) => a.timestamp - b.timestamp);

        // 2. Calculate cumulative sum
        let cumulative = 0;
        const points: ChartPoint[] = fundingEvents.map(e => {
            cumulative += e.amount;
            return {
                timestamp: e.timestamp,
                value: cumulative
            };
        });

        setChartData(points);
    }, []);

    const fetchEvents = useCallback(async () => {
        if (!publicClient) return;
        try {
            setLoading(true);
            const service = new ContractService(publicClient as any);
            // Fetch full transaction history from explorer instead of just logs
            const history = await service.getContractTransactions();
            setEvents(history);
            processChartData(history);
        } catch (err) {
            console.error("Failed to fetch global events:", err);
        } finally {
            setLoading(false);
        }
    }, [publicClient, processChartData]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        if (!sdk || !contractAddress) return;

        let subscription: any;

        const setup = async () => {
            try {
                subscription = await sdk.subscribe({
                    ethCalls: [],
                    eventContractSources: [contractAddress],
                    onData: (data: any) => {
                        try {
                            const res = data.result || data;
                            if (res.data && res.topics) {
                                const decoded = decodeEventLog({
                                    abi: SOMNIA_GOVERNANCE_ABI,
                                    data: res.data,
                                    topics: res.topics,
                                });

                                // Include metadata from the raw node notification
                                const eventWithMetadata = {
                                    ...decoded,
                                    blockNumber: res.blockNumber,
                                    transactionHash: res.transactionHash,
                                    // Reactivity doesn't give us timestamp directly easily without another call
                                    // but we can use now for the live chart feed
                                    timeStamp: (Date.now() / 1000).toString()
                                };

                                setEvents(prev => {
                                    const exists = prev.some(e =>
                                        e.transactionHash === eventWithMetadata.transactionHash &&
                                        e.eventName === eventWithMetadata.eventName
                                    );
                                    if (exists) return prev;

                                    const newEvents = [eventWithMetadata, ...prev];
                                    processChartData(newEvents);
                                    return newEvents;
                                });
                            }
                        } catch (err) {
                            // Ignore
                        }
                    }
                });
            } catch (err) {
                console.error("Failed to setup global events reactivity:", err);
            }
        };

        setup();

        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, [sdk, contractAddress, processChartData]);

    return { events, chartData, loading, refresh: fetchEvents };
}
