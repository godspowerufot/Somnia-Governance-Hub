export interface IVoteRepository {
    castVote(proposalId: string, support: boolean): Promise<void>;
    getVotesForProposal(proposalId: string): Promise<number[]>; // [yes, no]
}
