import { Proposal } from '../entities/proposal';

export interface IProposalRepository {
    getProposals(): Promise<Proposal[]>;
    getProposalById(id: string): Promise<Proposal | null>;
    createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'status' | 'yesVotes' | 'noVotes'>): Promise<string>;
}
