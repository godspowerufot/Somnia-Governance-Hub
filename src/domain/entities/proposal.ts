export interface Proposal {
    id: string;
    title: string;
    description: string;
    fundingGoal: bigint;
    currentFunding: bigint;
    yesVotes: number;
    noVotes: number;
    status: 'active' | 'passed' | 'failed' | 'funded';
    creator: string;
    createdAt: number;
}
