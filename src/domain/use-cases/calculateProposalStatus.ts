import { Proposal } from '../entities/proposal';

export const calculateProposalStatus = (proposal: Proposal): Proposal['status'] => {
    if (proposal.currentFunding >= proposal.fundingGoal) {
        return 'funded';
    }

    // Example logic: if it's been more than 7 days, it's either passed or failed based on votes
    // For now, just returning active
    return 'active';
};
